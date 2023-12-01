import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { fetchSchedule } from "../../app/api/scheduleAPI";

const scheduleAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.staff.specialty.localeCompare(b.staff.specialty),
});

const initialState = scheduleAdapter.getInitialState({
  loadingStatus: "idle",
  error: null,
});

export const fetchCurrentMonth = createAsyncThunk(
  "schedule/fetchDefault",
  async () => {
    const date = new Date();
    // [start: 2023-10-30T21:00:00.000Z] === 2023-10-31T00:00:00.000+03
    // Последний день предыдущего месяца для тех, чья смена закончится в этом месяце
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 0);
    // [end: 2023-11-30T20:59:59.999Z] === 2023-11-30T23:59:59.999+03
    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      1,
      0,
      0,
      0,
      -1,
    );
    return await fetchSchedule(firstDay, lastDay);
  },
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentMonth.pending, (state) => {
      state.loadingStatus = "loading";
    });
    builder.addCase(fetchCurrentMonth.fulfilled, (state, action) => {
      state.loadingStatus = "succeeded";
      scheduleAdapter.setAll(state, action.payload);
    });
    builder.addCase(fetchCurrentMonth.rejected, (state, action) => {
      state.loadingStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export default scheduleSlice.reducer;

export const {
  selectAll: selectAllSchedule,
  selectById: selectScheduleById,
  selectIds: selectScheduleIds,
} = scheduleAdapter.getSelectors((state) => state.schedule);

// export const {} = scheduleSlice.actions;

export const selectStaffForToday = createSelector(
  [selectAllSchedule],
  (schedule) => {
    return schedule.filter((record) => {
      // const startDate = new Date(record.start);
      // const endDate = new Date(record.end);
      // const date = new Date();
      // const today = date.getDate();
      // return startDate.getDate() === today || endDate.getDate() === today;
      console.log("selectStaffForToday");
      const now = new Date();
      return new Date(record.start) <= now && new Date(record.end) >= now;
    });
  },
);

export const selectCurrentStaff = createSelector(
  [selectStaffForToday],
  (schedule) =>
    schedule.filter((record) => {
      console.log("selectCurrentStaff");
      const now = new Date();
      return new Date(record.start) <= now && new Date(record.end) >= now;
    }),
);

export const selectScheduleLoadingStatus = (state) =>
  state.schedule.loadingStatus;
