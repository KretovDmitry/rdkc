import { client } from "./index";

export const fetchSchedule = async (start, end) => {
  const { data } = await client.get("schedule", {
    params: { start, end },
  });
  return data;
};
