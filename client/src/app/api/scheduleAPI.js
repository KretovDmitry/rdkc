import { client } from "./index";

export const fetchCurrentMonthSchedule = async () => {
  const { data } = await client.get("schedule");
  return data;
};
