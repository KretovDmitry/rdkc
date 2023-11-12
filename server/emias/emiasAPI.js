const axios = require("axios");
const { HOSPITALS, ICD_CODES } = require("./constants");
const {
  CurrentRequest,
  CurrentPatient,
  CurrentReanimationPeriod,
} = require("../models/models");

const today = new Date().toLocaleDateString("ru");

const patientsPayload = [
  {
    // Rean
    MedService_id: "11380",
    begDate: today,
    endDate: today,
    limit: "200",
  },
  {
    // TMK
    MedService_id: "500801000003930",
    begDate: today,
    endDate: today,
    limit: "200",
  },
  {
    // Children
    MedService_id: "500801000010630",
    begDate: today,
    endDate: today,
    limit: "200",
  },
];
const account = {
  login: "AFLopatin",
  psw: "Moniki1212",
};

function capitalize(str) {
  if (typeof str === "string") {
    const words = str.split(" ");
    const capitalized = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
    return capitalized.join(" ");
  } else {
    return str;
  }
}

const emias = axios.create({
  baseURL: "https://hospital.emias.mosreg.ru",
  headers: {
    Host: "hospital.emias.mosreg.ru",
    Connection: "keep-alive",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  },
});

async function fetchEmiasData() {
  try {
    if (!emias.defaults.headers.common["Cookie"]) {
      console.log("Cookie:", emias.defaults.headers.common["Cookie"]);
      await getCookies();
      await login(account.login, account.psw);
    }
    console.log("Cookie:", emias.defaults.headers.common["Cookie"]);
    const { patients, requests } = await getAllPatients(patientsPayload);
    const reanimationPeriods = {};
    for (const id of Object.keys(patients)) {
      const patient = await loadPatientData(id);
      patients[id] = { ...patients[id], ...patient };
      try {
        const { patientData, reanPeriod } = await getPatientEmkData(id);
        if (reanPeriod.hasOwnProperty("emiasId")) {
          reanimationPeriods[reanPeriod.emiasId] = reanPeriod;
        }
        const requestIds = patients[id].requestIds;
        for (const requestId of requestIds) {
          requests[requestId].isRean = patientData.isRean;
        }
      } catch (e) {
        console.log(e);
      }
    }
    return { patients, requests, reanimationPeriods };
  } catch (e) {
    console.log(e);
  }
}
async function getCookies() {
  console.log("getCookies");
  const response = await emias.get("/?c=portal&m=promed&from=promed", {
    headers: { Referer: "https://hospital.emias.mosreg.ru/?c=promed" },
  });
  const rawCookie = response.headers["set-cookie"];
  emias.defaults.headers.common["Cookie"] = rawCookie.map((el) =>
    el.slice(0, el.indexOf(";")),
  );
}
async function login(login, psw) {
  console.log("login");
  await emias.post(
    "?c=main&m=index&method=Logon&login=" + login,
    { login, psw },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
}
async function loadPatientData(id) {
  console.log("loadPatientData");
  const response = await emias.post(
    "https://hospital.emias.mosreg.ru/?c=Common&m=loadPersonData",
    { Person_id: id, mode: "PersonInfoPanel" },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const patientData = response.data[0];
  const patient = {};
  patient.firstName = capitalize(patientData["Person_Firname"]);
  patient.lastName = capitalize(patientData["Person_Surname"]);
  patient.middleName = capitalize(patientData["Person_Secname"]);
  patient.birthDate = patientData["Person_Birthday"];
  patient.age = patientData["Person_Age"];
  patient.isAdult = +patientData["Person_Age"] >= 18;
  patient.gender = patientData["Sex_Name"];
  patient.isIdentified = [
    patientData["DocumentType_Name"],
    patientData["Document_Num"],
    patientData["Person_Snils"],
  ].every(Boolean);
  patient.documentTypeName = patientData["DocumentType_Name"] || null;
  patient.documentSer = patientData["Document_Ser"] || null;
  patient.documentNum = patientData["Document_Num"] || null;
  patient.snils = patientData["Person_Snils"] || null;
  patient.omsCompany = patientData["OrgSmo_Name"] || null;
  patient.omsNumber =
    patientData["Polis_Ser"] && patientData["Polis_Num"]
      ? patientData["Polis_Ser"] + patientData["Polis_Num"]
      : patientData["Polis_Num"] || null;

  return patient;
}
async function getPatients(payload) {
  console.log(
    "getPatients",
    payload.MedService_id === "11380"
      ? "REANIMATION"
      : payload.MedService_id === "500801000003930"
      ? "TMK"
      : "CHILDREN",
  );
  const response = await emias.post(
    "?c=EvnUslugaTelemed&m=loadWorkPlaceGrid",
    { ...payload },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "*/*",
      },
    },
  );
  return response.data.data;
}
async function getAllPatients(payload) {
  const all = [];
  for (const p of payload) {
    const response = await getPatients(p);
    all.push(...response);
  }
  const patients = {};
  const requests = {};

  all.forEach((patient) => {
    if (!Object.keys(patients).includes(patient["Person_id"])) {
      patients[patient["Person_id"]] = {
        emiasId: patient["Person_id"],
        fio: capitalize(patient["Person_FIO"]),
        requestIds: [],
      };
    }
    patients[patient["Person_id"]].requestIds.push(patient["EvnDirection_Num"]);

    const icdCode = patient["Diag_FullName"].slice(
      0,
      patient["Diag_FullName"].indexOf(". "),
    );
    const isIcdCodeIncluded = ICD_CODES.includes(icdCode);

    requests[patient["EvnDirection_Num"]] = {
      emiasPatientId: patient["Person_id"],
      emiasRequestNumber: patient["EvnDirection_Num"],
      diagnosis: patient["Diag_FullName"],
      diagnosisCode: icdCode,
      IsIcdCodeValid: isIcdCodeIncluded,
      lpu: HOSPITALS[patient["Lpu_Nick"]] || patient["Lpu_Nick"],
      emiasCreationDate: patient["EvnDirection_insDate"],
      emiasCreationTime: patient["EvnDirection_insTime"],
      specialty: patient["LpuSectionProfile_Name"],
      tmk: patient["MedService_id"] === "500801000003930",
      childrenCenter: patient["MedService_id"] === "500801000010630",
      status:
        patient["EvnDirectionStatus_SysNick"] === "DirNew"
          ? "Queued"
          : patient["EvnDirectionStatus_SysNick"],
    };
  });
  return { patients, requests };
}

async function getPatientObjectValue(id) {
  console.log("getPatientObjectValue");
  const response = await emias.post(
    "https://hospital.emias.mosreg.ru/?c=EMK&m=getPersonEmkData",
    {
      Diag_id: 0,
      type: 0,
      level: 0,
      object: "Person",
      object_id: id,
      Person_id: id,
      ARMType: "common",
      user_LpuUnitType_SysNick: "stac",
      user_MedStaffFact_id: 37217,
      MedStaffFact_id: 0,
      LpuSection_id: 0,
      from_MZ: 1,
      useArchive: 0,
      node: "root",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  let requiredObject = response.data.find((obj) => {
    return obj["object_id"] === "EvnPS_id";
  });
  return requiredObject["object_value"];
}

async function getPatientEmkData(id) {
  const objectValue = await getPatientObjectValue(id);
  console.log("getPatientEmkData");
  const response = await emias.post(
    "https://hospital.emias.mosreg.ru/?c=Template&m=getEvnFormEvnPS",
    {
      user_MedStaffFact_id: 37217,
      object: "EvnPS",
      object_id: "EvnPS_id",
      object_value: objectValue,
      archiveRecord: 0,
      ARMType: "remoteconsultcenter",
      from_MZ: 1,
      from_MSE: 1,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  const patientData = {};
  const reanPeriod = {};
  const evnSection = response.data.map.EvnPS.item[0].children.EvnSection.item;
  const hasReanPeriod =
    evnSection[evnSection.length - 1].children.EvnReanimatPeriod.hasOwnProperty(
      "item",
    );
  if (hasReanPeriod) {
    const lastReanPeriod =
      evnSection[evnSection.length - 1].children.EvnReanimatPeriod.item[0].data;
    patientData.isRean = !lastReanPeriod.ReanimResultType_Name;
    reanPeriod.emiasId = lastReanPeriod.EvnReanimatPeriod_id;
    reanPeriod.emiasPatientId = id;
    reanPeriod.startDate = lastReanPeriod.EvnReanimatPeriod_setDate;
    reanPeriod.startTime = lastReanPeriod.EvnReanimatPeriod_setTime;
    reanPeriod.endDate = lastReanPeriod.EvnReanimatPeriod_disDate;
    reanPeriod.endTime = lastReanPeriod.EvnReanimatPeriod_disTime;
    reanPeriod.result = lastReanPeriod.ReanimResultType_Name;
  } else {
    patientData.isRean = false;
    console.log("Стационар");
  }
  console.log(patientData);
  console.log(reanPeriod);
  return { patientData, reanPeriod };
}
async function main() {
  try {
    const { patients, requests, reanimationPeriods } = await fetchEmiasData();
    await CurrentPatient.truncate();
    for (const patient of Object.values(patients)) {
      delete patient.requestIds;
      await CurrentPatient.create(patient);
      console.log(
        "----------------------Patient with FIO:",
        patient.fio,
        "was saved to the database----------------------",
      );
    }
    await CurrentRequest.truncate();
    for (const request of Object.values(requests)) {
      await CurrentRequest.create(request);
      console.log(
        "----------------------Request with emiasRequestNumber:",
        request.emiasRequestNumber,
        "was saved to the database----------------------",
      );
    }
    await CurrentReanimationPeriod.truncate();
    for (const period of Object.values(reanimationPeriods)) {
      await CurrentReanimationPeriod.create(period);
      console.log(
        "----------------------Reanimation Period with emiasId:",
        period.emiasId,
        "was saved to the database----------------------",
      );
    }
  } catch (e) {
    console.error(e);
  }
}

const minutes = 5;

const emiasAPI = () => {
  let counter = 1;
  setInterval(async () => {
    await main();
    console.log("Function main inside setInterval. Counter:", counter);
    counter++;
  }, minutes * 60000);
};

// module.exports = { fetchEmiasData };
module.exports = { emiasAPI, main };
