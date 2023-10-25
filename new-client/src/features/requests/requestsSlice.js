import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchCurrentRequests } from "../../http/requestsAPI";

const requestsAdapter = createEntityAdapter({
  selectId: (request) => request.emiasRequestNumber,
  sortComparer: (a, b) => a.specialty.localeCompare(b.specialty),
});

const initialState = requestsAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
  selectedState: "Queued",
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
    setSelectedState: (state, action) => {
      state.selectedState = action.payload;
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

export const { setSelectedState } = requestsSlice.actions;

export const selectRequestsByPatient = createSelector(
  [selectAllRequests, (state, patientId) => patientId],
  (requests, patientId) =>
    requests.filter((request) => request.emiasPatientId === patientId),
);

export const selectRequestSelectedState = (state) =>
  state.requests.selectedState;

const selectRequestsBySelectedState = createSelector(
  [selectAllRequests, selectRequestSelectedState],
  (requests, selectedState) => {
    return requests.filter((request) => request.status === selectedState);
  },
);

export const selectPatientsIdsWithRequestsWithSelectedState = createSelector(
  [selectRequestsBySelectedState],
  (requestsWithSelectedState) => {
    const patientsIds = [];
    requestsWithSelectedState.forEach((request) => {
      if (!patientsIds.includes(request.emiasPatientId)) {
        patientsIds.push(request.emiasPatientId);
      }
    });
    return patientsIds;
  },
);
