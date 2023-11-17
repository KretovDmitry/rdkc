import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchCurrentPatients } from "../../app/api/patientsAPI";

const patientsAdapter = createEntityAdapter({
  selectId: (patient) => patient.emiasId,
  sortComparer: (a, b) => a.fullName.localeCompare(b.fullName),
});

const initialState = patientsAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
});

export const fetchPatients = createAsyncThunk(
  "patients/fetchCurrent",
  async () => {
    return await fetchCurrentPatients();
  },
);

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPatients.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(fetchPatients.fulfilled, (state, action) => {
      state.loadingStatus = "succeeded";
      patientsAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchPatients.rejected, (state, action) => {
      state.loadingStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export default patientsSlice.reducer;

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPatients,
  selectById: selectPatientById,
  selectIds: selectPatientsIds,
} = patientsAdapter.getSelectors((state) => state.patients);

export const selectPatientsError = (state) => state.patients.error;
export const selectPatientsLoadingStatus = (state) =>
  state.patients.loadingStatus;
