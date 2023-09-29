import { $host } from "./index";

export const fetchRequests = async () => {
  const { data } = await $host.get("api/request");
  return data;
};
