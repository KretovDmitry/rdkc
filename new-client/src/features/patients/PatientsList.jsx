import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "./patientsSlice";
import {
  fetchRequests,
  selectPatientsIdsBySelectedStatus,
  selectRequestsBySelectedStatus,
} from "../requests/requestsSlice";
import s from "./Patients.module.css";
import { fetchReanimationPeriods } from "../reanimationPeriods/reanimationPeriodsSlice";
import { Spinner } from "../../components/Spinner/Spinner";
import PatientCard from "./PatientCard";

const PatientsList = () => {
  const dispatch = useDispatch();
  const patientsIds = useSelector((state) =>
    selectPatientsIdsBySelectedStatus(state),
  );
  const error = useSelector((state) => state.patients.error);
  const requestsIds = useSelector((state) =>
    selectRequestsBySelectedStatus(state),
  );

  const RequestsLoadingStatus = useSelector(
    (state) => state.requests.loadingStatus,
  );
  const ReanimationPeriodsLoadingStatus = useSelector(
    (state) => state.reanimationPeriods.loadingStatus,
  );
  const PatientsLoadingStatus = useSelector(
    (state) => state.patients.loadingStatus,
  );

  useEffect(() => {
    if (RequestsLoadingStatus === "idle") {
      dispatch(fetchRequests());
    }
  }, [RequestsLoadingStatus, dispatch]);
  useEffect(() => {
    if (ReanimationPeriodsLoadingStatus === "idle") {
      dispatch(fetchReanimationPeriods());
    }
  }, [ReanimationPeriodsLoadingStatus, dispatch]);
  useEffect(() => {
    if (PatientsLoadingStatus === "idle") {
      dispatch(fetchPatients());
    }
  }, [PatientsLoadingStatus, dispatch]);

  let content;

  if (PatientsLoadingStatus === "loading") {
    content = <Spinner />;
  } else if (PatientsLoadingStatus === "succeeded") {
    content = patientsIds.map((emiasId) => {
      return <PatientCard key={emiasId} emiasId={emiasId} />;
    });
  } else if (PatientsLoadingStatus === "failed") {
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
