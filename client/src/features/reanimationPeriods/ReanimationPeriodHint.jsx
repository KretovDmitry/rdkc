import React from "react";
import s from "./ReanimationPeriod.module.css";

const ReanimationPeriodHint = ({ reanimationPeriod, hintClass }) => {
  return reanimationPeriod.hasReanPeriod ? (
    <div className={s[hintClass]}>
      <div className={s.gridDescription}>
        <div>С</div>
        <div>{reanimationPeriod.startDate}</div>
        <div>{reanimationPeriod.startTime}</div>
      </div>
      {reanimationPeriod.endDate ? (
        <>
          <div className={s.gridDescription}>
            <div>По</div>
            <div>{reanimationPeriod.endDate}</div>
            <div>{reanimationPeriod.endTime}</div>
          </div>
          <div>{reanimationPeriod.result}</div>
        </>
      ) : (
        <div>В реанимации</div>
      )}
    </div>
  ) : (
    <div className={s.hint}>Реанимационный период отсутствует</div>
  );
};

export default ReanimationPeriodHint;
