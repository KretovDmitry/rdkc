import { client } from "./index";

export const fetchCurrentPatients = async () => {
  const { data } = await client.get("api/patients");
  return data;
};
