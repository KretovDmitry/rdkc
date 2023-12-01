import React from "react";
import { useSelector } from "react-redux";
import {
  selectPatientsError,
  selectPatientsLoadingStatus,
} from "./patientsSlice";
import {
  selectPatientsIdsBySelectedStatus,
  selectRequestsBySelectedStatus,
} from "../requests/requestsSlice";
import s from "./Patients.module.css";
import PatientCard from "./PatientCard";

const PatientsList = () => {
  const patientsLoadingStatus = useSelector(selectPatientsLoadingStatus);
  const error = useSelector(selectPatientsError);
  const patientsIds = useSelector(selectPatientsIdsBySelectedStatus);
  const requestsIds = useSelector(selectRequestsBySelectedStatus);

  let content;

  if (patientsLoadingStatus === "succeeded") {
    content = patientsIds.length ? (
      patientsIds.map((emiasId) => (
        <PatientCard key={emiasId} emiasId={emiasId} />
      ))
    ) : (
      <div className={s.john}>
        <img
          alt="Нет заявок"
          src="http://172.16.5.162:3000/gif/john-travolta-searching.gif"
        ></img>
      </div>
    );
  } else if (patientsLoadingStatus === "failed") {
    content = <div>{error}</div>;
  }

  return (
    <>
      <div className={s.quantity}>
        <h3>Количество пациентов: {patientsIds.length}</h3>
        <h3>Количество заявок: {requestsIds.length}</h3>
      </div>
      {content}
    </>
  );
};

export default PatientsList;
