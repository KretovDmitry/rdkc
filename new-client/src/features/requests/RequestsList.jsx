import React from "react";
import { useSelector } from "react-redux";
import {
  selectRequestById,
  selectRequestsByPatient,
  selectRequestsSelectedStatus,
} from "./requestsSlice";
import s from "./Requests.module.css";

const Request = ({ requestId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  const tmk = request.tmk ? <div>TMK</div> : null;
  const childrenCenter = request.childrenCenter ? (
    <div>Детский центр</div>
  ) : null;
  return (
    <li>
      <div>
        {tmk}
        {childrenCenter}
        <div>{request.emiasCreationDate}</div>
        <div>{request.emiasCreationTime}</div>
        <div>{request.diagnosisCode}</div>
        <div>{request.specialty}</div>
      </div>
    </li>
  );
};

const RequestsList = ({ patientId }) => {
  const loadingStatus = useSelector((state) => state.requests.loadingStatus);
  const error = useSelector((state) => state.requests.error);
  const requestsForPatient = useSelector((state) =>
    selectRequestsByPatient(state, patientId),
  );
  const requestsSelectedStatus = useSelector((state) =>
    selectRequestsSelectedStatus(state),
  );

  let content;

  if (loadingStatus === "loading") {
    // content = <Spinner text="Loading..." />;
    content = "Loading...";
  } else if (loadingStatus === "succeeded") {
    content = requestsForPatient.map((request) => {
      return request.status === requestsSelectedStatus ? (
        <Request
          key={request.emiasRequestNumber}
          requestId={request.emiasRequestNumber}
        />
      ) : null;
    });
  } else if (loadingStatus === "failed") {
    content = <div>{error}</div>;
  }

  return (
    <section>
      <ul className={s.requestsList}>{content}</ul>
    </section>
  );
};

export default RequestsList;
