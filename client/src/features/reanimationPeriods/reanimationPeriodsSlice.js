import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchCurrentReanimationPeriods } from "../../app/api/reanimationPeriodsAPI";

const reanimationPeriodsAdapter = createEntityAdapter({
  selectId: (period) => period.emiasPatientId,
});

const initialState = reanimationPeriodsAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
});

export const fetchReanimationPeriods = createAsyncThunk(
  "reanimationPeriods/fetchCurrent",
  async () => {
    return await fetchCurrentReanimationPeriods();
  },
);

const reanimationPeriodsSlice = createSlice({
  name: "reanimationPeriods",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchReanimationPeriods.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(fetchReanimationPeriods.fulfilled, (state, action) => {
      state.loadingStatus = "succeeded";
      reanimationPeriodsAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchReanimationPeriods.rejected, (state, action) => {
      state.loadingStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export default reanimationPeriodsSlice.reducer;

export const {
  selectAll: selectAllReanimationPeriods,
  selectById: selectReanimationPeriodById,
  selectIds: selectReanimationPeriodsIds,
} = reanimationPeriodsAdapter.getSelectors((state) => state.reanimationPeriods);

export const selectRpError = (state) => state.reanimationPeriods.error;
export const selectRpLoadingStatus = (state) =>
  state.reanimationPeriods.loadingStatus;
