import { configureStore } from "@reduxjs/toolkit";
import patientsReducer from "../features/patients/patientsSlice";
import requestsReducer from "../features/requests/requestsSlice";
import reanimationPeriodsReducer from "../features/reanimationPeriods/reanimationPeriodsSlice";
import scheduleReducer from "../features/schedules/scheduleSlice";
import usersReducer from "../features/users/usersSlice";
export const store = configureStore({
  reducer: {
    user: usersReducer,
    patients: patientsReducer,
    requests: requestsReducer,
    reanimationPeriods: reanimationPeriodsReducer,
    schedule: scheduleReducer,
  },
});
