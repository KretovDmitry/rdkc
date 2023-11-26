import React from "react";
import { useSelector } from "react-redux";
import { selectAllSchedule } from "./scheduleSlice";

const SchedulePage = () => {
  const error = useSelector((state) => state.schedule.error);
  const loadingStatus = useSelector((state) => state.schedule.loadingStatus);
  const all = useSelector(selectAllSchedule);

  let content;

  if (loadingStatus === "succeeded") {
    content = all.map((entity) => (
      <div key={entity.id}>
        <p>
          {entity.staff.fullName}: {new Date(entity.start).toLocaleString()} -{" "}
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
