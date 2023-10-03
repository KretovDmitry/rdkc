import React, { useContext } from "react";
import { Context } from "../index";
import { sortRequestsByStatus } from "../utils/functions";
import PatientCard from "../components/request/PatientCard";
import RequestsStatesSelectorNav from "../components/request/RequestsStatesSelectorNav";
import { Card, Row } from "react-bootstrap";

const Request = ({ requests }) => {
  const { requestStore } = useContext(Context);
  console.log("Request was rendered at", new Date().toLocaleTimeString());

  // useEffect(() => {
  //   fetchRequests().then((data) => requestStore.setRequests(data));
  // });

  const sortedRequests = sortRequestsByStatus(
    requests,
    requestStore.selectedState,
  ).map((request) => {
    return (
      <PatientCard key={`${request["EvnDirection_id"]}`} request={request} />
    );
  });

  return (
    <Card>
      <RequestsStatesSelectorNav />
      <Card.Body>
        <Row xxl={2} xl={2} lg={2} sm={1} xs={1} className="g-3">
          {sortedRequests}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Request;
