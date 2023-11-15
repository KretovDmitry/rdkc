import React from "react";
import s from "./ReanimationPeriod.module.css";

export const IsReanSelector = ({ patientId, handleIsRean }) => {
  return (
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
};

export const ZeroData = () => {
  return (
    <div className={s.hintDiv}>
      <div className={s.text}>Нет данных</div>
      <div className={s.hint}>Данные о реанимационном периоде не получены</div>
    </div>
  );
};
