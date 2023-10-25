const axios = require("axios");
const { HOSPITALS, ICD_CODES } = require("./constants");
const { CurrentRequest, CurrentPatient } = require("../models/models");

const today = new Date().toLocaleDateString("ru");

const patientsPayload = [
  {
    MedService_id: "11380",
    begDate: today,
    endDate: today,
    limit: "200",
  },
  {
    MedService_id: "500801000003930",
    begDate: today,
    endDate: today,
    limit: "200",
  },
  {
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
    for (const id of Object.keys(patients)) {
      const patient = await loadPatientData(id);
      patients[id] = { ...patients[id], ...patient };
    }
    return { patients, requests };
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
      : payload.MedService_id === "500801000010630"
      ? "CHILDREN"
      : "TMK",
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
  for (let p of payload) {
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
        // requests: [],
      };
    }
    // patients[patient["Person_id"]].requests.push(patient["EvnDirection_Num"]);

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
      tmk: patient["MedService_id"] !== "11380",
      status:
        patient["EvnDirectionStatus_SysNick"] === "DirNew"
          ? "Queued"
          : patient["EvnDirectionStatus_SysNick"],
    };
  });
  return { patients, requests };
}
async function main() {
  const { patients, requests } = await fetchEmiasData();
  await CurrentPatient.truncate();
  for (const patient of Object.values(patients)) {
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
}

const minutes = 5;

const emiasAPI = () => {
  let counter = 1;
  setInterval(async () => {
    await main();
    console.log("function main inside setInterval call counter:", counter);
    counter++;
  }, minutes * 60000);
};

// module.exports = { fetchEmiasData };
module.exports = { emiasAPI, main };
