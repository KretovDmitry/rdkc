import { client } from "./index";

export const fetchCurrentPatients = async () => {
  const { data } = await client.get("api/patients");
  return data;
};
export const createPatient = async (data) => {
  const { success } = await client.post("api/patients", { data });
  return success;
};
