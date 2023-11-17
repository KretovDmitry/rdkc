import React from "react";
import { useSelector } from "react-redux";
import {
  selectRequestsByPatient,
  selectRequestsError,
  selectRequestsLoadingStatus,
} from "./requestsSlice";
import s from "./Requests.module.css";

const Request = ({ request }) => {
  const tmk = request.tmk ? <div className={s.accent}>TMK</div> : null;
  const childrenCenter = request.childrenCenter ? (
    <div className={s.accent}>Детский центр</div>
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

const RequestsList = ({ patientId, requestsSelectedStatus }) => {
  const loadingStatus = useSelector(selectRequestsLoadingStatus);
  const error = useSelector(selectRequestsError);
  const requestsForPatient = useSelector((state) =>
    selectRequestsByPatient(state, patientId),
  );

  let content;

  if (loadingStatus === "succeeded") {
    content = requestsForPatient.map((request) => {
      return request.status === requestsSelectedStatus ? (
        <Request key={request.emiasRequestNumber} request={request} />
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
