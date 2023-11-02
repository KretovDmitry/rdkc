import React from "react";
import s from "./Requests.module.css";
import SelectStatusButton from "../../components/Buttons/SelectStatusButton";

const SelectRequestsStatus = () => {
  return (
    <fieldset className={s.selectRequestsStatus}>
      <legend className={s.selectRequestsStatusLegend}>Статус заявок</legend>
      <SelectStatusButton text="Активные" statusValue="Queued" />
      <SelectStatusButton text="Выполненные" statusValue="Serviced" />
      <SelectStatusButton text="Отмененные" statusValue="Canceled" />
    </fieldset>
  );
};

export default SelectRequestsStatus;
