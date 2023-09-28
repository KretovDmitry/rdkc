import React from "react";
import { Card, Col } from "react-bootstrap";
import { capitalize } from "../../utils/functions";

const PatientCard = ({ request, specialties }) => {
  console.log(specialties);
  return (
    <Col>
      <Card>
        {/* SHOULD BE PATIENT_ID WHEN SPECIALTIES COMBINED*/}
        <Card.Header
          className={"d-flex justify-content-between align-items-center"}
        >
          <div>{capitalize(request["Person_FIO"])}</div>
          <div>{`${request["EvnDirection_insDate"]}`}</div>
        </Card.Header>
        <Card.Body>
          <div className={"d-flex flex-column "}>
            <div>{`${request["Lpu_Nick"]}`}</div>
            <div>{`${request["Diag_FullName"]}`}</div>
          </div>
          <div>
            {specialties.map((specialty, idx) => (
              <div key={idx}>{specialty}</div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default PatientCard;
