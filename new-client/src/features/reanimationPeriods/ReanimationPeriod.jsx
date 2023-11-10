import React from "react";
import { useSelector } from "react-redux";
import { selectRequestById } from "../requests/requestsSlice";
import s from "./ReanimationPeriod.module.css";
import { selectReanimationPeriodById } from "./reanimationPeriodsSlice";
import { toast, ToastContainer } from "react-toastify";
import { selectPatientById } from "../patients/patientsSlice";

const ReanimationPeriod = ({ requestId, patientId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  const reanimationPeriod = useSelector((state) =>
    selectReanimationPeriodById(state, patientId),
  );
  const patient = useSelector((state) => selectPatientById(state, patientId));
  const reanimationPeriodExists = reanimationPeriod !== undefined;
  const isDead = reanimationPeriod?.result === "Смерть";
  const hintClass = isDead ? "hintDead" : "hint";
  if (isDead) {
    toast.error(
      `${patient.fullName} переведён из реанимации с исходом: Смерть!`,
      {
        position: "bottom-left",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      },
    );
  }
  const hintBlock = reanimationPeriodExists ? (
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
  return (
    <div className={s.hintDiv}>
      {isDead ? (
        <>
          <div className={s.deadText}>Смерть</div>
          <ToastContainer />
        </>
      ) : (
        <div className={s.text}>
          {request.isRean ? "Реанимация" : "Стационар"}
        </div>
      )}
      {hintBlock}
    </div>
  );
};

export default ReanimationPeriod;
