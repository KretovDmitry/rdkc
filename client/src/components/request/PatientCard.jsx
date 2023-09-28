import React from "react";
import { Card, Col } from "react-bootstrap";
import { capitalize } from "../../utils/functions";

const PatientCard = ({ request }) => {
  console.log(request);
  return (
    <Col>
      <Card>
        {/* SHOULD BE PATIENT_ID WHEN SPECIALTIES COMBINED*/}
        <Card.Header
          className={"d-flex justify-content-between align-items-center"}
        >
          <p>{capitalize(request["Person_FIO"])}</p>
          <p>{`${request["EvnDirection_insDate"]}`}</p>
        </Card.Header>
        <Card.Body>
          <Card.Text className={"d-flex flex-column "}>
            <p>{`${request["Lpu_Nick"]}`}</p>
            <p>{`${request["Diag_FullName"]}`}</p>
          </Card.Text>
          <Card.Text>{`${request["LpuSectionProfile_Name"]}`}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default PatientCard;
