import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchCurrentRequests } from "../../app/api/requestsAPI";

const requestsAdapter = createEntityAdapter({
  selectId: (request) => request.emiasRequestNumber,
  sortComparer: (a, b) => a.specialty.localeCompare(b.specialty),
});

const initialState = requestsAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
  selectedStatus: "Queued",
});
export const fetchRequests = createAsyncThunk(
  "requests/fetchCurrent",
  async () => {
    return await fetchCurrentRequests();
  },
);

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setRequestCreatedById: (state, action) => {
      state.entities[action.payload]['isCreated'] = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRequests.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(fetchRequests.fulfilled, (state, action) => {
      state.loadingStatus = "succeeded";
      requestsAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchRequests.rejected, (state, action) => {
      state.loadingStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export default requestsSlice.reducer;

// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllRequests,
  selectById: selectRequestById,
  selectIds: selectRequestsIds,
} = requestsAdapter.getSelectors((state) => state.requests);

export const { setSelectedStatus, setRequestCreatedById } = requestsSlice.actions;

export const selectRequestsByPatient = createSelector(
  [selectAllRequests, (state, patientId) => patientId],
  (requests, patientId) =>
    requests.filter((request) => request.emiasPatientId === patientId),
);

export const selectRequestsError = (state) => state.requests.error;
export const selectRequestsLoadingStatus = (state) =>
  state.requests.loadingStatus;
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
