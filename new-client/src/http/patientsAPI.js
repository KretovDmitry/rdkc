import { client } from "./index";

export const fetchCurrentPatients = async () => {
  const { data } = await client.get("api/patients");
  return data;
};
export const createPatient = async (emiasPatientId) => {
  const { data } = await client.post("api/patients", { emiasPatientId });
  return data.success;
};
