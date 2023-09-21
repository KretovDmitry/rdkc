require("dotenv").config();
const superagent = require("superagent").agent();

const today = new Date().toLocaleDateString("ru");
const account = {
  emiasLogin: process.env.EMIAS_DEFAULT_LOGIN,
  psw: process.env.EMIAS_DEFAULT_PASSWORD,
};
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
];

const loadWork = async (payload, account) => {
  const cookies = await getCookies();
  console.log("getCookies() =>", cookies);
  await superagent
    .post(process.env.EMIAS_LOGIN_URL + account.emiasLogin)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .set("Cookie", cookies)
    .send(account);
  console.log("superagent() => Logged in!");
  return getAllPatients(payload);
};

const getCookies = async () => {
  const response = await superagent.get(process.env.EMIAS_START_URL);
  const cookies = response.header["set-cookie"][0];
  return cookies.slice(0, cookies.indexOf(";"));
};

const getPatients = async (payload) => {
  const response = await superagent
    .post(process.env.EMIAS_WORK_GRID_URL)
    .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
    .send(payload);
  console.log(
    "getPatients() => totalCount:",
    JSON.parse(response.text)["totalCount"],
  );
  return JSON.parse(response.text)["data"];
};

const getAllPatients = async (payload) => {
  const patients = [];
  for (p of payload) {
    const response = await getPatients(p);
    patients.push(...response);
  }
  console.log("getAllPatients() => trulyTotalCount:", patients.length);
  return patients;
};

(async () => {
  const all = await loadWork(patientsPayload, account);
  // console.log("loadWork() =>", all);
})();
