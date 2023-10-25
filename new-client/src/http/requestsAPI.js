import { client } from "./index";

export const fetchCurrentRequests = async () => {
  const { data } = await client.get("api/requests");
  return data;
};
