const superagent = require("superagent").agent();
require("dotenv").config();
const today = new Date().toLocaleDateString("ru");
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
    return await this.getAllPatients(this.patientsPayload);
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
    const patients = [];
    for (let p of payload) {
      const response = await this.getPatients(p);
      patients.push(...response);
    }
    console.log("getAllPatients() => trulyTotalCount:", patients.length);
    return patients;
  };
}

module.exports = { Emias };

// (async () => {
//   const emias = new Emias(today, today);
//   const all = await emias.loadWork();
//   // console.log("loadWork() =>", all);
// })();
