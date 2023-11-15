import { client } from "./index";

export const fetchCurrentReanimationPeriods = async () => {
  const { data } = await client.get("reanimation");
  return data;
};
export const createReanimationPeriods = async (emiasPatientId) => {
  const { data } = await client.post("reanimation", { emiasPatientId });
  return data;
};
