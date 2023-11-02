import React from "react";
import { useSelector } from "react-redux";
import { selectRequestById } from "../requests/requestsSlice";
import s from "./ReanimationPeriod.module.css";
import { selectReanimationPeriodById } from "./reanimationPeriodsSlice";

const ReanimationPeriod = ({ requestId, patientId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  const reanimationPeriod = useSelector((state) =>
    selectReanimationPeriodById(state, patientId),
  );
  const hintBlock =
    reanimationPeriod === undefined ? (
      <div className={s.hint}>Реанимационный период отсутствует</div>
    ) : (
      <div className={s.hint}>
        <div className={s.gridDescription}>
          <div>С</div>
          <div>{reanimationPeriod.startDate}</div>
          <div>{reanimationPeriod.startTime}</div>
        </div>
        {reanimationPeriod.endDate ? (
          <div className={s.gridDescription}>
            <div>По</div>
            <div>{reanimationPeriod.endDate}</div>
            <div>{reanimationPeriod.endTime}</div>
          </div>
        ) : (
          <div>В реанимации</div>
        )}
      </div>
    );
  return (
    <div className={s.hintDiv}>
      <div className={s.text}>
        {request.isRean ? "Реанимация" : "Стационар"}
      </div>
      {hintBlock}
    </div>
  );
};

export default ReanimationPeriod;
