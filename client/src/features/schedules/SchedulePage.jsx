import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentMonth,
  selectAllSchedule,
  selectScheduleLoadingStatus,
} from "./scheduleSlice";

const SchedulePage = () => {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.schedule.error);
  const loadingStatus = useSelector(selectScheduleLoadingStatus);
  const all = useSelector(selectAllSchedule);
  useEffect(() => {
    if (loadingStatus === "idle") {
      dispatch(fetchCurrentMonth());
    }
  }, [loadingStatus, dispatch]);

  let content;

  if (loadingStatus === "succeeded") {
    content = all.map((entity) => (
      <div key={entity.id}>
        <p>
          {entity.staff.specialty} {entity.staff.fullName}:{" "}
          {new Date(entity.start).toLocaleString()} -{" "}
          {new Date(entity.end).toLocaleString()}
        </p>
      </div>
    ));
  } else if (loadingStatus === "failed") {
    content = <div>{error}</div>;
  }
  return content;
};

export default SchedulePage;
