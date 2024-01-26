const axios = require("axios");
const { HOSPITALS, ICD_CODES, DEBUG } = require("./constants");
const {
  CurrentRequest,
  CurrentPatient,
  CurrentReanimationPeriod,
  Request,
} = require("../models/models");
const account = {
  login: "AFLopatin",
  psw: "Moniki1212",
};

function capitalize(str) {
  if (typeof str === "string") {
    const words = str.split(" ");
    const capitalized = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return capitalized.join(" ");
  } else {
    return str;
  }
}

function checkStatus(status) {
  if (status === "DirNew" || status === "DirZap") {
    return "Queued";
  }
  return status;
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
  proxy: false,
  timeout: 120000, //code: 'ECONNRESET'
});

async function getCookies() {
  if (DEBUG) {
    console.log(new Date().toLocaleString("ru"), "getCookies");
  }
  const response = await emias.get("/?c=portal&m=promed&from=promed", {
    headers: { Referer: "https://hospital.emias.mosreg.ru/?c=promed" },
  });
  const rawCookie = response.headers["set-cookie"];
  emias.defaults.headers.common["Cookie"] = rawCookie.map((el) =>
    el.slice(0, el.indexOf(";"))
  );
}
async function login(login, psw) {
  if (DEBUG) {
    console.log(new Date().toLocaleString("ru"), "login");
  }
  await emias.post(
    "?c=main&m=index&method=Logon&login=" + login,
    { login, psw },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}
async function getPatients(payload) {
  if (DEBUG) {
    console.log(
      new Date().toLocaleString("ru"),
      "getPatients",
      payload.MedService_id === "11380"
        ? "REANIMATION"
        : payload.MedService_id === "500801000003930"
        ? "TMK"
        : "CHILDREN"
    );
  }
  try {
    const response = await emias.post(
      "?c=EvnUslugaTelemed&m=loadWorkPlaceGrid",
      { ...payload },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "*/*",
        },
      }
    );
    return response.data.data;
  } catch (e) {
    console.log(e?.response?.status || e);
    return [];
  }
}
async function getAllPatients() {
  const patientsPayload = [
    {
      // Reanimation
      MedService_id: "11380",
      begDate: new Date().toLocaleDateString("ru"),
      endDate: new Date().toLocaleDateString("ru"),
      limit: "200",
    },
    {
      // TMK
      MedService_id: "500801000003930",
      begDate: new Date().toLocaleDateString("ru"),
      endDate: new Date().toLocaleDateString("ru"),
      limit: "200",
    },
    {
      // Children
      MedService_id: "500801000010630",
      begDate: new Date().toLocaleDateString("ru"),
      endDate: new Date().toLocaleDateString("ru"),
      limit: "200",
    },
  ];
  const all = [];
  const patients = {};
  const requests = {};

  // make requests to the emias server to collect all patients
  for (const p of patientsPayload) {
    const response = await getPatients(p);
    // if (!response) return 0;
    all.push(...response);
  }

  // select already collected once
  const currentRequests = await CurrentRequest.findAll();

  if (DEBUG) {
    console.log(
      new Date().toLocaleString("ru"),
      "Emias:",
      all.length,
      "\tCurrent:",
      currentRequests.length
    );
  }

  // compare statuses every time except
  // there are new requests (all > current)
  // or serever filtered out yesterday's requests (all < current)
  if (all.length === currentRequests.length) {
    const statusChanged = all.some((record) => {
      const saved = currentRequests.find(
        (req) => req["emiasRequestNumber"] === record["EvnDirection_Num"]
      );
      if (!saved) {
        return false;
      }
      const status = checkStatus(record["EvnDirectionStatus_SysNick"]);
      return saved["status"] !== status;
    });
    if (DEBUG && !statusChanged) {
      console.log(new Date().toLocaleString("ru"), "Status hasn't changed");
      return 0;
    }
  }

  // log about new request just for fun
  if (all.length - currentRequests.length > 0) {
    if (DEBUG) {
      console.log(
        new Date().toLocaleString("ru"),
        "New request:",
        all.length - currentRequests.length
      );
    }
  }

  // log about server reset just for fun
  if (all.length - currentRequests.length < 0) {
    if (DEBUG) {
      console.log(new Date().toLocaleString("ru"), "Daily server reset");
    }
  }

  // collect data from main requests table, i.e.
  // EvnUslugaTelemed & loadWorkPlaceGrid response
  for (const record of all) {
    if (!Object.keys(patients).includes(record["Person_id"])) {
      patients[record["Person_id"]] = {
        emiasId: record["Person_id"],
        fio: capitalize(record["Person_FIO"]),
        requestsIds: [],
      };
    }
    patients[record["Person_id"]].requestsIds.push(record["EvnDirection_Num"]);

    const icdCode = record["Diag_FullName"].slice(
      0,
      record["Diag_FullName"].indexOf(". ")
    );
    const isIcdCodeIncluded = ICD_CODES.includes(icdCode);

    requests[record["EvnDirection_Num"]] = {
      emiasPatientId: record["Person_id"],
      emiasRequestNumber: record["EvnDirection_Num"],
      diagnosis: record["Diag_FullName"],
      diagnosisCode: icdCode,
      IsIcdCodeValid: isIcdCodeIncluded,
      lpu: HOSPITALS[record["Lpu_Nick"]] || record["Lpu_Nick"],
      emiasCreationDate: record["EvnDirection_insDate"],
      emiasCreationTime: record["EvnDirection_insTime"],
      specialty: record["LpuSectionProfile_Name"],
      tmk: record["MedService_id"] === "500801000003930",
      childrenCenter: record["MedService_id"] === "500801000010630",
      status: checkStatus(record["EvnDirectionStatus_SysNick"]),
    };
  }
  return { patients, requests };
}
async function loadPatientData(id) {
  try {
    if (DEBUG) {
      console.log(new Date().toLocaleString("ru"), `loadPatientData for ${id}`);
    }
    const response = await emias.post(
      "https://hospital.emias.mosreg.ru/?c=Common&m=loadPersonData",
      { Person_id: id, mode: "PersonInfoPanel" },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
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
      patientData["Document_Num"] || patientData["Document_Ser"],
      patientData["Person_Snils"],
      patientData["Polis_Num"],
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
  } catch (e) {
    if (DEBUG) {
      console.error(
        new Date().toLocaleString("ru"),
        `loadPatientData ${id} ERROR:`,
        e?.code || e
      );
    }
  }
}
async function getHospitalizationId(
  emiasPatientId,
  creationDate,
  creationTime
) {
  if (DEBUG) {
    console.log(
      new Date().toLocaleString("ru"),
      "getHospitalizationId for",
      emiasPatientId
    );
  }
  const response = await emias.post(
    "https://hospital.emias.mosreg.ru/?c=EMK&m=getPersonEmkData",
    {
      Diag_id: 0,
      type: 0,
      level: 0,
      object: "Person",
      object_id: emiasPatientId,
      Person_id: emiasPatientId,
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
    }
  );
  const hospitalizations = response.data.filter((obj) => {
    // Find all hospitalizations
    return obj["object_id"] === "EvnPS_id";
  });
  if (hospitalizations.length === 1) return hospitalizations[0]["object_value"];
  const hospitalization = hospitalizations.find((obj) => {
    try {
      // Check for declined hospitalization
      const hospitalizationTitle = obj.title;
      const hospitalizationTitleArr = hospitalizationTitle.split(" / ");
      if (
        hospitalizationTitleArr[hospitalizationTitleArr.length - 1] === "Отказ"
      ) {
        return false;
      }
      // Find first hospitalization in DSC server response
      // excluding a possible transfer to another hospital after submitting the application
      const dateString = obj.date;
      const dateTimeArr = dateString.split(" ");
      const dateArr = dateTimeArr[0].split(".").reverse();
      const timeArr = dateTimeArr[1].split(":");
      const date = new Date(...dateArr, ...timeArr);
      const creationDateArr = creationDate.split(".").reverse();
      const creationTimeArr = creationTime.split(":");
      const requestCreationDate = new Date(
        ...creationDateArr,
        ...creationTimeArr
      );
      return requestCreationDate > date;
    } catch (e) {
      console.log(e);
      return 0;
    }
  });
  // in case of closed data (psychiatric)
  return hospitalization ? hospitalization["object_value"] : 0;
}
async function getPatientEmkData(
  emiasPatientId,
  objectValue,
  emiasRequestNumber
) {
  if (DEBUG) {
    console.log(
      new Date().toLocaleString("ru"),
      "getPatientEmkData for",
      emiasPatientId,
      "with object value",
      objectValue
    );
  }
  try {
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
      }
    );
    const evnPsItems = response.data.map["EvnPS"].item;
    const evnPsItem = evnPsItems.find((obj) => obj["EvnPS_id"] === objectValue);
    const evnSectionItems = evnPsItem.children["EvnSection"].item;
    const hasCurrentRequest = (element) => {
      const dirNumString = element.data["EvnDirection_NumRaw"];
      const dirNumArr = dirNumString.split(" ");
      const dirNum = dirNumArr[dirNumArr.length - 1];
      return dirNum === emiasRequestNumber;
    };
    const evnSection = evnSectionItems.find((obj) => {
      const directionsSection = obj.children["EvnDirectionStac"];
      if (!directionsSection.hasOwnProperty("item")) {
        return false;
      }
      const directions = directionsSection.item;
      return directions.some(hasCurrentRequest);
    });
    return { evnSection, error: false };
  } catch (e) {
    if (DEBUG) {
      console.error(
        new Date().toLocaleString("ru"),
        "getPatientEmkData ERROR:",
        e?.code || e
      );
    }
    return { evnSection: null, error: true };
  }
}
function getReanimationPeriod(
  emiasPatientId,
  objectValue,
  currentEvent,
  error
) {
  const reanPeriod = {};
  if (error) {
    reanPeriod.emiasPatientId = emiasPatientId;
    reanPeriod.hasReanPeriod = false;
    reanPeriod.isRean = false;
    reanPeriod.objectValue = objectValue;
    reanPeriod.error = true;
    if (DEBUG) {
      console.log(
        new Date().toLocaleString("ru"),
        `Reanimation Period for ${emiasPatientId}:`,
        reanPeriod
      );
    }
    return reanPeriod;
  }
  const hasReanPeriod =
    currentEvent.children["EvnReanimatPeriod"].hasOwnProperty("item");
  if (hasReanPeriod) {
    const lastReanPeriod =
      currentEvent.children["EvnReanimatPeriod"].item[0].data;
    reanPeriod.emiasId = lastReanPeriod["EvnReanimatPeriod_id"];
    reanPeriod.emiasPatientId = emiasPatientId;
    reanPeriod.startDate = lastReanPeriod["EvnReanimatPeriod_setDate"];
    reanPeriod.startTime = lastReanPeriod["EvnReanimatPeriod_setTime"];
    reanPeriod.endDate = lastReanPeriod["EvnReanimatPeriod_disDate"];
    reanPeriod.endTime = lastReanPeriod["EvnReanimatPeriod_disTime"];
    reanPeriod.result = lastReanPeriod["ReanimResultType_Name"];
    reanPeriod.isRean = !lastReanPeriod["ReanimResultType_Name"];
    reanPeriod.hasReanPeriod = true;
  } else {
    reanPeriod.emiasPatientId = emiasPatientId;
    reanPeriod.hasReanPeriod = false;
    reanPeriod.isRean = false;
  }
  reanPeriod.objectValue = objectValue;
  reanPeriod.error = false;
  if (DEBUG) {
    console.log(
      new Date().toLocaleString("ru"),
      `Reanimation Period for ${emiasPatientId}:`,
      reanPeriod
    );
  }
  return reanPeriod;
}
async function fetchEmiasData() {
  try {
    if (!emias.defaults.headers.common["Cookie"]) {
      if (DEBUG) {
        console.log(
          new Date().toLocaleString("ru"),
          "Cookie:",
          emias.defaults.headers.common["Cookie"]
        );
      }
      await getCookies();
      if (DEBUG) {
        console.log(
          new Date().toLocaleString("ru"),
          "Cookie:",
          emias.defaults.headers.common["Cookie"]
        );
      }
      await login(account.login, account.psw);
    }
    const response = await getAllPatients();
    if (!response) return 0;
    const reanimationPeriods = {};
    for (const id of Object.keys(response.patients)) {
      const patient = await loadPatientData(id);
      response.patients[id] = { ...response.patients[id], ...patient };
      const requestForPatient =
        response.requests[response.patients[id].requestsIds[0]];
      const hospitalizationId = await getHospitalizationId(
        id,
        requestForPatient.emiasCreationDate,
        requestForPatient.emiasCreationTime
      );
      let reanPeriod = {};
      if (!hospitalizationId) {
        reanPeriod.emiasPatientId = id;
        reanPeriod.hasReanPeriod = false;
        reanPeriod.isRean = false;
        reanPeriod.objectValue = null;
        reanPeriod.error = true;
      } else {
        const { evnSection, error } = await getPatientEmkData(
          id,
          hospitalizationId,
          response.patients[id].requestsIds[0]
        );
        reanPeriod = getReanimationPeriod(
          id,
          hospitalizationId,
          evnSection,
          error
        );
      }
      reanimationPeriods[id] = reanPeriod;
      for (const requestId of response.patients[id].requestsIds) {
        response.requests[requestId].isRean = reanPeriod.isRean;
        if (DEBUG) {
          console.log(
            new Date().toLocaleString("ru"),
            `Patient ${id} Request ${requestId} isRean = ${reanPeriod.isRean}; error = ${reanPeriod.error}`
          );
        }
      }
    }
    return { ...response, reanimationPeriods };
  } catch (e) {
    console.log(e);
  }
}
async function main() {
  try {
    const response = await fetchEmiasData();
    if (!response) return;
    await CurrentPatient.truncate();
    for (const patient of Object.values(response.patients)) {
      delete patient.requestsIds;
      await CurrentPatient.create(patient);
      if (DEBUG) {
        console.log(
          new Date().toLocaleString("ru"),
          "----------------------Patient with FIO:",
          patient.fio,
          "was saved to the database----------------------"
        );
      }
    }
    await CurrentRequest.truncate();
    for (const request of Object.values(response.requests)) {
      const isCreated = await Request.findOne({
        where: {
          emiasRequestNumber: request.emiasRequestNumber,
        },
      });
      request.isCreated = isCreated !== null;
      await CurrentRequest.create(request);
      if (DEBUG) {
        console.log(
          new Date().toLocaleString("ru"),
          "----------------------Request with emiasRequestNumber:",
          request.emiasRequestNumber,
          "was saved to the database----------------------"
        );
      }
    }
    await CurrentReanimationPeriod.truncate();
    for (const period of Object.values(response.reanimationPeriods)) {
      await CurrentReanimationPeriod.create(period);
      if (DEBUG) {
        console.log(
          new Date().toLocaleString("ru"),
          "----------------------Reanimation Period with emiasId:",
          period.emiasId,
          "was saved to the database----------------------"
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
}

const minutes = 1;

const emiasAPI = () => {
  let counter = 1;
  setInterval(async () => {
    await main();
    if (DEBUG) {
      console.log(
        new Date().toLocaleString("ru"),
        "Function main call counter inside setInterval:",
        counter
      );
    }
    counter++;
  }, minutes * 60000);
};

// module.exports = { fetchEmiasData };
module.exports = { emiasAPI, main };
