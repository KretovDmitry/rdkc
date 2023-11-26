import React from "react";
import { useSelector } from "react-redux";
import s from "./ReanimationPeriod.module.css";
import {
  selectReanimationPeriodById,
  selectRpError,
  selectRpLoadingStatus,
} from "./reanimationPeriodsSlice";
import { selectPatientById } from "../patients/patientsSlice";
import ToastDeadError from "../../components/Toasts/ToastDeadError";
import ReanimationPeriodHint from "./ReanimationPeriodHint";
import { IsReanSelector, ZeroData } from "./IsReanSelector";

const ReanimationPeriod = ({
  patientId,
  requestsSelectedStatus,
  handleIsRean,
}) => {
  const rpLoadingStatus = useSelector(selectRpLoadingStatus);
  const error = useSelector(selectRpError);
  const reanimationPeriod = useSelector((state) =>
    selectReanimationPeriodById(state, patientId),
  );
  const patient = useSelector((state) => selectPatientById(state, patientId));

  let content;

  if (rpLoadingStatus === "succeeded") {
    const isDead = reanimationPeriod.result === "Смерть";
    const hintClass = isDead ? "hintDead" : "hint";
    if (reanimationPeriod.error) {
      content =
        requestsSelectedStatus === "Queued" ? (
          <IsReanSelector patientId={patientId} handleIsRean={handleIsRean} />
        ) : (
          <ZeroData />
        );
    } else {
      content = (
        <div className={s.hintDiv}>
          {isDead ? (
            <>
              <div className={s.deadText}>Смерть</div>
              {/*<ToastDeadError deadName={patient.fullName} />*/}
            </>
          ) : (
            <div className={s.text}>
              {reanimationPeriod.isRean ? "Реанимация" : "Стационар"}
            </div>
          )}
          <ReanimationPeriodHint
            reanimationPeriod={reanimationPeriod}
            hintClass={hintClass}
          />
        </div>
      );
    }
  } else if (rpLoadingStatus === "failed") {
    content = <div>{error}</div>;
  }
  return content;
};

export default ReanimationPeriod;
