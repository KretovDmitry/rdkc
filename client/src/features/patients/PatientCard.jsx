import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectPatientById } from "./patientsSlice";
import {
  selectRequestIdByPatientId,
  selectRequestsSelectedStatus,
} from "../requests/requestsSlice";
import CreateButton from "../../components/Buttons/CreateButton";
import s from "./Patients.module.css";
import LpuName from "./LpuName";
import ReanimationPeriod from "../reanimationPeriods/ReanimationPeriod";
import RequestsList from "../requests/RequestsList";

const PatientCard = ({ emiasId }) => {
  const patient = useSelector((state) => selectPatientById(state, emiasId));
  const requestId = useSelector((state) =>
    selectRequestIdByPatientId(state, emiasId),
  );
  const requestsSelectedStatus = useSelector((state) =>
    selectRequestsSelectedStatus(state),
  );
  const [isRean, setIsRean] = useState(true);
  const handleIsRean = (value) => {
    console.log(value);
    setIsRean(value !== "stac");
  };
  const createButton =
    requestsSelectedStatus === "Queued" ? (
      <CreateButton patientId={emiasId} isRean={isRean} />
    ) : null;
  return (
    <article className={s.patientCard}>
      <div className={s.patientCardHeader}>
        <h4 className={s.patientFIO}>{patient.fullName}</h4>
        <div className={s.patientAdditionalHeaderInfo}>
          <div>Дата рождения: {patient.birthDate}</div>
          {patient.isAdult ? (
            <div>Взрослые</div>
          ) : (
            <div className={s.accent}>Дети</div>
          )}
        </div>
      </div>
      <div className={s.patientCardHeader}>
        <LpuName requestId={requestId} />
        <ReanimationPeriod
          patientId={emiasId}
          requestsSelectedStatus={requestsSelectedStatus}
          handleIsRean={handleIsRean}
        />
      </div>
      <RequestsList patientId={patient.emiasId} />
      {createButton}
    </article>
  );
};

export default PatientCard;
