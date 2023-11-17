import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatients,
  selectPatientsError,
  selectPatientsLoadingStatus,
} from "./patientsSlice";
import {
  selectPatientsIdsBySelectedStatus,
  selectRequestsBySelectedStatus,
} from "../requests/requestsSlice";
import s from "./Patients.module.css";
import { Spinner } from "../../components/Spinner/Spinner";
import PatientCard from "./PatientCard";

const PatientsList = ({ todayStaff }) => {
  const dispatch = useDispatch();
  const patientsLoadingStatus = useSelector(selectPatientsLoadingStatus);
  const error = useSelector(selectPatientsError);
  const patientsIds = useSelector(selectPatientsIdsBySelectedStatus);
  const requestsIds = useSelector(selectRequestsBySelectedStatus);
  useEffect(() => {
    if (patientsLoadingStatus === "idle") {
      dispatch(fetchPatients());
    }
  }, [patientsLoadingStatus, dispatch]);

  let content;

  if (patientsLoadingStatus === "loading") {
    content = <Spinner />;
  } else if (patientsLoadingStatus === "succeeded") {
    content = patientsIds.map((emiasId) => {
      return (
        <PatientCard key={emiasId} emiasId={emiasId} todayStaff={todayStaff} />
      );
    });
  } else if (patientsLoadingStatus === "failed") {
    content = <div>{error}</div>;
  }

  return (
    <>
      <div className={s.quantity}>
        <h3>Количество пациентов: {patientsIds.length}</h3>
        <h3>Количество заявок: {requestsIds.length}</h3>
      </div>
      {patientsIds.length ? content : "Нет заявок"}
    </>
  );
};

export default PatientsList;
