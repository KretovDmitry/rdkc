import { client } from "./index";

export const fetchCurrentPatients = async () => {
  const { data } = await client.get("patients");
  return data;
};
export const createPatient = async (emiasPatientId) => {
  const { data } = await client.post("patients", { emiasPatientId });
  return data;
};
