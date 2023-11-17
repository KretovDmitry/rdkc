import { client } from "./index";

export const fetchCurrentRequests = async () => {
  const { data } = await client.get("requests");
  return data;
};
export const createRequests = async (
  emiasPatientId,
  isRean,
  patientId,
  userId,
  staffIds,
  newReanimationPeriodId,
) => {
  const { data } = await client.post("requests", {
    emiasPatientId,
    isRean,
    patientId,
    userId,
    staffIds,
    newReanimationPeriodId,
  });
  return data;
};
