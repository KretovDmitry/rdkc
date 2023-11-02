const superagent = require("superagent").agent();
require("dotenv").config();
const { HOSPITALS } = require("./constants");
const today = new Date().toLocaleDateString("ru");

const capitalize = (str) => {
  if (typeof str === "string") {
    const words = str.split(" ");
    const capitalized = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
    return capitalized.join(" ");
  } else {
    return str;
  }
};
class Emias {
  constructor(begDate, endDate) {
    this.patientsPayload = [
      {
        MedService_id: "11380",
        begDate: begDate,
        endDate: endDate,
        limit: "200",
      },
      {
        MedService_id: "500801000003930",
        begDate: begDate,
        endDate: endDate,
        limit: "200",
      },
    ];
    this.account = {
      login: "AFLopatin",
      psw: "Moniki1212",
    };
  }
  loadWork = async () => {
    try {
      const cookies = await this.getCookies();
      console.log("getCookies() =>", cookies);
      await superagent
        .post(
          "http://hospital.emias.mosreg.ru/?c=main&m=index&method=Logon&login=" +
            this.account.login,
        )
        .set("Content-Type", "application/x-www-form-urlencoded")
        .set("Cookie", cookies)
        .send(this.account);
      const { patients, requests } = await this.getAllPatients(
        this.patientsPayload,
      );
      for (const id of Object.keys(patients)) {
        const patient = await this.loadPatientData(id, cookies);
        patients[id] = { ...patients[id], ...patient };
      }
      return { patients, requests };
    } catch (e) {
      console.log(e);
    }
  };
  getCookies = async () => {
    const response = await superagent.get(
      "http://hospital.emias.mosreg.ru/?c=portal&m=promed&lang=ru",
    );
    const cookies = response.header["set-cookie"][0];
    return cookies.slice(0, cookies.indexOf(";"));
  };
  getPatients = async (payload) => {
    const response = await superagent
      .post(
        "http://hospital.emias.mosreg.ru/?c=EvnUslugaTelemed&m=loadWorkPlaceGrid",
      )
      .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
      .send(payload);
    console.log(
      "getPatients() => totalCount:",
      JSON.parse(response.text)["totalCount"],
    );
    return JSON.parse(response.text)["data"];
  };
  getAllPatients = async (payload) => {
    console.log("superagent() => Logged in!");
    const all = [];
    for (let p of payload) {
      const response = await this.getPatients(p);
      all.push(...response);
    }
    console.log("getAllPatients() => trulyTotalCount:", all.length);
    const patients = {};
    const requests = {};
    all.forEach((patient) => {
      if (!Object.keys(patients).includes(patient["Person_id"])) {
        patients[patient["Person_id"]] = {
          id: patient["Person_id"],
          fio: capitalize(patient["Person_FIO"]),
          requests: [],
        };
      }
      patients[patient["Person_id"]].requests.push(patient["EvnDirection_Num"]);
      requests[patient["EvnDirection_Num"]] = {
        id: patient["EvnDirection_Num"],
        diagnosis: patient["Diag_FullName"],
        diagnosisCode: patient["Diag_FullName"].slice(
          0,
          patient["Diag_FullName"].indexOf(". "),
        ),
        lpu: HOSPITALS[patient["Lpu_Nick"]] || patient["Lpu_Nick"],
        creationDate: patient["EvnDirection_insDate"],
        creationTime: patient["EvnDirection_insTime"],
        specialty: patient["LpuSectionProfile_Name"],
        tmk: patient["MedService_id"] !== "11380",
        status: patient["EvnDirectionStatus_SysNick"],
      };
    });
    return { patients, requests };
  };
  loadPatientData = async (id, cookies) => {
    const data = await superagent
      .post("https://hospital.emias.mosreg.ru/?c=Common&m=loadPersonData")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("Cookie", cookies)
      .send({
        Person_id: id,
        mode: "PersonInfoPanel",
      });
    const patient = {};
    patient.firstName = data["Person_Firname"]
      ? data["Person_Firname"].charAt(0).toUpperCase() +
        data["Person_Firname"].slice(1).toLowerCase()
      : data["Person_Firname"];
    patient.lastName = data["Person_Surname"]
      ? data["Person_Surname"].charAt(0).toUpperCase() +
        data["Person_Surname"].slice(1).toLowerCase()
      : data["Person_Surname"];
    patient.middleName = data["Person_Secname"]
      ? data["Person_Secname"].charAt(0).toUpperCase() +
        data["Person_Secname"].slice(1).toLowerCase()
      : data["Person_Secname"];
    patient.birthDate = data["Person_Birthday"];
    patient.age = data["Person_Age"];
    patient.isAdult = +data["Person_Age"] >= 18;
    patient.sex = data["Sex_Name"];
    patient.isIdentificated =
      data["DocumentType_Name"] && data["Document_Num"] && data["Person_Snils"];
    patient.documentTypeName = data["DocumentType_Name"];
    patient.documentSer = data["Document_Ser"];
    patient.documentNum = data["Document_Num"];
    patient.snils = data["Person_Snils"];
    patient.omsName = data["OrgSmo_Name"];
    patient.omsNum =
      data["Polis_Ser"] && data["Polis_Num"]
        ? data["Polis_Ser"] + data["Polis_Num"]
        : data["Polis_Num"] || "";

    return patient;
  };
}

// module.exports = { Emias };

(async () => {
  const emias = new Emias(today, today);
  const all = await emias.loadWork();
  console.log("loadWork() =>", all);
})();
