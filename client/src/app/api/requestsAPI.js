import { client } from "./index";

export const fetchCurrentRequests = async () => {
  const { data } = await client.get("requests");
  return data;
};
export const createRequests = async (emiasPatientId) => {
  const { data } = await client.post("patients", { emiasPatientId });
  return data.success;
};
