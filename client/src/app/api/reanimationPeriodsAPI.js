import { client } from "./index";

export const fetchCurrentReanimationPeriods = async () => {
  const { data } = await client.get("reanimation");
  return data;
};
export const createReanimationPeriods = async (objectValue) => {
  const { data } = await client.post("reanimation", { objectValue });
  return data;
};
