import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import patientsReducer from "../features/patients/patientsSlice";
import requestsReducer from "../features/requests/requestsSlice";
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    patients: patientsReducer,
    requests: requestsReducer,
  },
});
