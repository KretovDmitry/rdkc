import React, { useContext } from "react";
import { Card, Row } from "react-bootstrap";
import { Context } from "../../index";
import PatientCard from "./PatientCard";
import { sortRequestsByStatus } from "../../utils/functions";
import RequestsStatesSelectorNav from "./RequestsStatesSelectorNav";
import { observer } from "mobx-react-lite";

const RequestsContainer = observer((props) => {
  const { requestStore } = useContext(Context);

  const sortedRequests = sortRequestsByStatus(
    props.requests,
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
});

export default RequestsContainer;
