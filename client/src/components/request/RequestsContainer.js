import React from "react";
import { Card, Row } from "react-bootstrap";
import RequestsStatesSelectorNav from "./RequestsStatesSelectorNav";
import { observer } from "mobx-react-lite";
import PatientsList from "./list/PatientsList";

const RequestsContainer = observer((props) => {
  console.log(
    "RequestsContainer was rendered at",
    new Date().toLocaleTimeString(),
  );

  return (
    <Card>
      <RequestsStatesSelectorNav />
      <Card.Body>
        <Row xxl={1} xl={1} lg={1} sm={1} xs={1} className="g-3">
          <PatientsList />
        </Row>
      </Card.Body>
    </Card>
  );
});

export default RequestsContainer;
