import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients, selectPatientById } from "./patientsSlice";
import RequestsList from "../requests/RequestsList";
import {
  fetchRequests,
  selectPatientsIdsWithRequestsWithSelectedState,
  setSelectedState,
} from "../requests/requestsSlice";

const SelectRequestsStatus = () => {
  const dispatch = useDispatch();

  return (
    <fieldset>
      <legend>Button group</legend>
      <input
        type="button"
        value="Queued"
        onClick={() => dispatch(setSelectedState("Queued"))}
      />
      <input
        type="button"
        value="Serviced"
        onClick={() => dispatch(setSelectedState("Serviced"))}
      />
      <input
        type="button"
        value="Canceled"
        onClick={() => dispatch(setSelectedState("Canceled"))}
      />
    </fieldset>
  );
};

const Patient = ({ emiasId }) => {
  const patient = useSelector((state) => selectPatientById(state, emiasId));
  return (
    <article
      style={{
        maxWidth: "100%",
        border: "1px solid orange",
        padding: "0 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          textAlign: "left",
        }}
      >
        <h4 style={{ margin: "0", marginBlockEnd: "5px", minWidth: "333px" }}>
          {patient.fullName}
        </h4>
        <div style={{ display: "flex", minWidth: "288px" }}>
          <div style={{}}>Дата рождения: {patient.birthDate}</div>
          <div style={{ paddingInlineStart: "20px" }}>
            {patient.isAdult ? "Взрослые" : "Дети"}
          </div>
        </div>
      </div>
      <RequestsList key={patient.emiasId} patientId={patient.emiasId} />
    </article>
  );
};

const PatientsList = () => {
  const dispatch = useDispatch();
  const patientsIds = useSelector((state) =>
    selectPatientsIdsWithRequestsWithSelectedState(state),
  );
  const error = useSelector((state) => state.patients.error);

  const PatientsLoadingStatus = useSelector(
    (state) => state.patients.loadingStatus,
  );
  const RequestsLoadingStatus = useSelector(
    (state) => state.requests.loadingStatus,
  );

  useEffect(() => {
    if (PatientsLoadingStatus === "idle") {
      dispatch(fetchPatients());
    }
  }, [PatientsLoadingStatus, dispatch]);

  useEffect(() => {
    if (RequestsLoadingStatus === "idle") {
      dispatch(fetchRequests());
    }
  }, [RequestsLoadingStatus, dispatch]);

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
    <section
      style={{
        maxWidth: 750,
        margin: "0 auto",
        marginBlockEnd: "50px",
        padding: "0 10px",
        border: "1px solid blue",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3>PATIENTS {patientsIds.length}</h3>
      <SelectRequestsStatus />
      {patientsIds.length ? content : "Нет заявок"}
    </section>
  );
};

export default PatientsList;
