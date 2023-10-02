import React, { useContext } from "react";
import { Card, Row } from "react-bootstrap";
import { Context } from "../../index";
import PatientCard from "./PatientCard";
import { sortRequestsByStatus } from "../../utils/functions";
import RequestsContainerHeader from "./RequestsContainerHeader";

const RequestsContainer = () => {
  const { requestStore } = useContext(Context);

  return (
    <Card>
      <RequestsContainerHeader />
      <Card.Body>
        <Row xxl={2} xl={2} lg={2} sm={1} xs={1} className="g-3">
          {sortRequestsByStatus(
            requestStore.getRequests,
            requestStore.selectedState,
          ).map((request) => {
            return (
              <PatientCard
                key={`${request["EvnDirection_id"]}`}
                request={request}
              />
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RequestsContainer;
