import React, { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients, selectPatientById } from "./patientsSlice";
import RequestsList from "../requests/RequestsList";
import {
  fetchRequests,
  selectPatientsIdsBySelectedStatus,
  selectRequestIdByPatientId,
  selectRequestsSelectedStatus,
} from "../requests/requestsSlice";
import LpuName from "./LpuName";
import s from "./Patients.module.css";
import CreateButton from "../../components/Buttons/CreateButton";
import { fetchReanimationPeriods } from "../reanimationPeriods/reanimationPeriodsSlice";
import ReanimationPeriod from "../reanimationPeriods/ReanimationPeriod";

const Patient = ({ emiasId }) => {
  const patient = useSelector((state) => selectPatientById(state, emiasId));
  const requestId = useSelector((state) =>
    selectRequestIdByPatientId(state, emiasId),
  );
  const requestsSelectedStatus = useSelector((state) =>
    selectRequestsSelectedStatus(state),
  );
  const createButton =
    requestsSelectedStatus === "Queued" ? (
      <CreateButton patientId={emiasId} />
    ) : null;
  return (
    <article className={s.patientCard}>
      <div className={s.patientCardHeader}>
        <h4 className={s.patientFIO}>{patient.fullName}</h4>
        <div className={s.patientAdditionalHeaderInfo}>
          <div>Дата рождения: {patient.birthDate}</div>
          <div>{patient.isAdult ? "Взрослые" : "Дети"}</div>
        </div>
      </div>
      <div className={s.patientCardHeader}>
        <LpuName requestId={requestId} />
        <ReanimationPeriod requestId={requestId} patientId={emiasId} />
      </div>
      <RequestsList patientId={patient.emiasId} />
      {createButton}
    </article>
  );
};

const PatientsList = () => {
  const dispatch = useDispatch();
  const patientsIds = useSelector((state) =>
    selectPatientsIdsBySelectedStatus(state),
  );
  const error = useSelector((state) => state.patients.error);

  const RequestsLoadingStatus = useSelector(
    (state) => state.requests.loadingStatus,
  );
  useEffect(() => {
    if (RequestsLoadingStatus === "idle") {
      dispatch(fetchRequests());
    }
  }, [RequestsLoadingStatus, dispatch]);

  const ReanimationPeriodsLoadingStatus = useSelector(
    (state) => state.reanimationPeriods.loadingStatus,
  );
  useEffect(() => {
    if (ReanimationPeriodsLoadingStatus === "idle") {
      dispatch(fetchReanimationPeriods());
    }
  }, [ReanimationPeriodsLoadingStatus, dispatch]);

  const PatientsLoadingStatus = useSelector(
    (state) => state.patients.loadingStatus,
  );

  useEffect(() => {
    if (PatientsLoadingStatus === "idle") {
      dispatch(fetchPatients());
    }
  }, [PatientsLoadingStatus, dispatch]);

  let content;

  if (PatientsLoadingStatus === "loading") {
    // content = <Spinner text="Loading..." />;
    content = "Loading...";
  } else if (PatientsLoadingStatus === "succeeded") {
    content = patientsIds.map((emiasId) => {
      return <Patient key={emiasId} emiasId={emiasId} />;
    });
  } else if (PatientsLoadingStatus === "failed") {
    content = <div>{error}</div>;
  }

  return (
    <Fragment>
      <h3 className={s.patientsQuantity}>
        Количество пациентов: {patientsIds.length}
      </h3>
      {patientsIds.length ? content : "Нет заявок"}
    </Fragment>
  );
};

export default PatientsList;
