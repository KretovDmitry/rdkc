import { client } from "./index";

export const fetchCurrentReanimationPeriods = async () => {
  const { data } = await client.get("reanimationPeriods");
  return data;
};
