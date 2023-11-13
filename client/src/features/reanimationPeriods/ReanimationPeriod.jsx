import React from "react";
import { useSelector } from "react-redux";
import s from "./ReanimationPeriod.module.css";
import { selectReanimationPeriodById } from "./reanimationPeriodsSlice";
import { toast, ToastContainer } from "react-toastify";
import { selectPatientById } from "../patients/patientsSlice";

const ReanimationPeriod = ({
  patientId,
  requestsSelectedStatus,
  handleIsRean,
}) => {
  const reanimationPeriod = useSelector((state) =>
    selectReanimationPeriodById(state, patientId),
  );
  const patient = useSelector((state) => selectPatientById(state, patientId));
  const isDead = reanimationPeriod?.result === "Смерть";
  const hintClass = isDead ? "hintDead" : "hint";
  if (isDead) {
    toast.error(
      `${patient.fullName} переведён из реанимации с исходом: Смерть!`,
      {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      },
    );
  }
  const hintBlock = reanimationPeriod.hasReanPeriod ? (
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
  const isReanCheckbox = (
    <fieldset className={s.radioFieldset}>
      <legend>Отделение</legend>
      <div>
        <input
          type="radio"
          id={"rean" + patientId}
          name={patientId}
          value="rean"
          onChange={(e) => handleIsRean(e.target.value)}
          defaultChecked={true}
        />
        <label htmlFor={"rean" + patientId}>Реанимация</label>
      </div>
      <div>
        <input
          type="radio"
          id={"stac" + patientId}
          name={patientId}
          value="stac"
          onChange={(e) => handleIsRean(e.target.value)}
        />
        <label htmlFor={"stac" + patientId}>Стационар</label>
      </div>
    </fieldset>
  );
  const zeroData = (
    <div className={s.hintDiv}>
      <div className={s.text}>Нет данных</div>
      <div className={s.hint}>Данные о реанимационном периоде не получены</div>
    </div>
  );
  if (reanimationPeriod.error) {
    return requestsSelectedStatus === "Queued" ? isReanCheckbox : zeroData;
  }
  return (
    <div className={s.hintDiv}>
      {isDead ? (
        <>
          <div className={s.deadText}>Смерть</div>
          <ToastContainer />
        </>
      ) : (
        <div className={s.text}>
          {reanimationPeriod.isRean ? "Реанимация" : "Стационар"}
        </div>
      )}
      {hintBlock}
    </div>
  );
};

export default ReanimationPeriod;
