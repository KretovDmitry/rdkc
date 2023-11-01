import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import patientsReducer from "../features/patients/patientsSlice";
import requestsReducer from "../features/requests/requestsSlice";
import reanimationPeriodsReducer from "../features/reanimationPeriods/reanimationPeriodsSlice";
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    patients: patientsReducer,
    requests: requestsReducer,
    reanimationPeriods: reanimationPeriodsReducer,
  },
});
