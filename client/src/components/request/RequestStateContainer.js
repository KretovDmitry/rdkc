import React, { useContext } from "react";
import { Card, Col, Container, Nav, Row } from "react-bootstrap";
import { Context } from "../../index";
import { observer } from "mobx-react-lite";

const capitalize = (str) => {
  if (typeof str === "string") {
    const words = str.split(" ");
    const capitalized = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
    return capitalized.join(" ");
  } else {
    return str;
  }
};

const RequestStateContainer = observer(() => {
  const { work } = useContext(Context);
  return (
    <Container className="mt-2">
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <Nav variant="tabs" defaultActiveKey={`#${work.states[0].link}`}>
            {work.states.map((state) => (
              <Nav.Item>
                <Nav.Link
                  key={state.id}
                  href={`#${state.link}`}
                  onClick={() => work.setSelectedState(state.status)}
                >
                  {state.name}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
        <Card.Body>
          <Row xs={1} md={2} className="g-4">
            {work.requests.map((request, idx) => {
              const cards = [];
              if (
                request["EvnDirectionStatus_SysNick"] === work.selectedState
              ) {
                cards.push(
                  <Col key={request["EvnDirection_Num"]}>
                    <Card key={request["EvnDirection_Num"]}>
                      {/* SHOULD BE PATIENT_ID WHEN SPECIALTIES COMBINED*/}
                      <Card.Body>
                        <Card.Title
                          className={
                            "d-flex justify-content-between align-items-center"
                          }
                        >
                          <div>{capitalize(request["Person_FIO"])}</div>
                          <div>{`${request["EvnDirection_insDate"]}`}</div>
                        </Card.Title>
                        <Card.Text className={"d-flex flex-column "}>
                          <div>{`${request["Lpu_Nick"]}`}</div>
                          <div>{`${request["Diag_FullName"]}`}</div>
                        </Card.Text>
                        <Card.Text>{`${request["LpuSectionProfile_Name"]}`}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>,
                );
              }
              return cards;
            })}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default RequestStateContainer;
