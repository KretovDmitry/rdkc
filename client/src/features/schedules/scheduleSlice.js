import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchCurrentMonthSchedule } from "../../app/api/scheduleAPI";

const scheduleAdapter = createEntityAdapter();

const initialState = scheduleAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
});

export const fetchSchedule = createAsyncThunk(
  "schedule/fetchCurrentMonth",
  async () => {
    return await fetchCurrentMonthSchedule();
  },
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSchedule.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(fetchSchedule.fulfilled, (state, action) => {
      state.loadingStatus = "succeeded";
      scheduleAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchSchedule.rejected, (state, action) => {
      state.loadingStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export default scheduleSlice.reducer;

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllRequests,
  selectById: selectRequestById,
  selectIds: selectRequestsIds,
} = scheduleAdapter.getSelectors((state) => state.schedule);

export const { setSelectedStatus } = scheduleSlice.actions;

export const selectRequestsByPatient = createSelector(
  [selectAllRequests, (state, patientId) => patientId],
  (requests, patientId) =>
    requests.filter((request) => request.emiasPatientId === patientId),
);

export const selectRequestsSelectedStatus = (state) =>
  state.requests.selectedStatus;

export const selectRequestIdByPatientId = (state, patientId) => {
  const requestsForPatient = Object.values(state.requests.entities).find(
    (request) => request.emiasPatientId === patientId,
  );
  return requestsForPatient.emiasRequestNumber;
};

export const selectRequestsBySelectedStatus = createSelector(
  [selectAllRequests, selectRequestsSelectedStatus],
  (requests, selectedStatus) => {
    return requests.filter((request) => request.status === selectedStatus);
  },
);

export const selectPatientsIdsBySelectedStatus = createSelector(
  [selectRequestsBySelectedStatus],
  (requestsWithSelectedStatus) => {
    const patientsIds = [];
    requestsWithSelectedStatus.sort((a, b) => {
      if (
        a.emiasCreationDate + a.emiasCreationTime >
        b.emiasCreationDate + b.emiasCreationTime
      ) {
        return -1;
      } else if (
        a.emiasCreationDate + a.emiasCreationTime <
        b.emiasCreationDate + b.emiasCreationTime
      ) {
        return 1;
      }
      return 0;
    });
    requestsWithSelectedStatus.forEach((request) => {
      if (!patientsIds.includes(request.emiasPatientId)) {
        patientsIds.push(request.emiasPatientId);
      }
    });
    return patientsIds;
  },
);
