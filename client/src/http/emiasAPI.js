import axios from "axios";
// const axios = require("axios");

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
];
const account = {
  login: "AFLopatin",
  psw: "Moniki1212",
};
const emias = axios.create({
  baseURL: "http://hospital.emias.mosreg.ru",
  headers: {
    Host: "hospital.emias.mosreg.ru",
    Connection: "keep-alive",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  },
});

export async function loadWork() {
  await getCookies();
  await login(account.login, account.psw);
  return await getAllPatients(patientsPayload);
}

async function getCookies() {
  const response = await emias.get("/?c=portal&m=promed&from=promed", {
    headers: { Referer: "http://hospital.emias.mosreg.ru/?c=promed" },
  });
  const rawCookie = response.headers["set-cookie"];
  emias.defaults.headers.common["Cookie"] = rawCookie.map((el) =>
    el.slice(0, el.indexOf(";")),
  );
}

async function login(login, psw) {
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

async function getPatients(payload) {
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
  const patients = [];
  for (let p of payload) {
    const response = await getPatients(p);
    patients.push(...response);
  }
  return patients;
}

(async () => {
  const work = await loadWork();
  console.log("loadWork() =>", work);
})();
