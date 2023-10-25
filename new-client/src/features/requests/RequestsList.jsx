import React from "react";
import { useSelector } from "react-redux";
import {
  selectRequestById,
  selectRequestsByPatient,
  selectRequestSelectedState,
} from "./requestsSlice";

const Request = ({ requestId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  return (
    <ul>
      <li>
        <div style={{ display: "flex", maxHeight: "20px" }}>
          <span style={{ paddingInlineStart: "10px" }}>
            {request.emiasCreationDate}
          </span>
          <span style={{ paddingInlineStart: "10px" }}>
            {request.emiasCreationTime}
          </span>
          <span style={{ paddingInlineStart: "10px" }}>
            {request.specialty}
          </span>
          <span style={{ paddingInlineStart: "10px", alignSelf: "center" }}>
            {request.emiasRequestNumber}
          </span>
          <span style={{ paddingInlineStart: "10px", alignSelf: "center" }}>
            {request.status}
          </span>
        </div>
      </li>
    </ul>
  );
};

const RequestsList = ({ patientId }) => {
  const loadingStatus = useSelector((state) => state.requests.loadingStatus);
  const error = useSelector((state) => state.requests.error);
  const requestsForPatient = useSelector((state) =>
    selectRequestsByPatient(state, patientId),
  );
  const requestSelectedState = useSelector((state) =>
    selectRequestSelectedState(state),
  );

  let content;

  if (loadingStatus === "loading") {
    // content = <Spinner text="Loading..." />;
    content = "Loading...";
  } else if (loadingStatus === "succeeded") {
    content = requestsForPatient.map((request) => {
      return request.status === requestSelectedState ? (
        <Request
          key={request.emiasRequestNumber}
          requestId={request.emiasRequestNumber}
        />
      ) : null;
    });
  } else if (loadingStatus === "failed") {
    content = <div>{error}</div>;
  }

  return <section>{content}</section>;
};

export default RequestsList;
