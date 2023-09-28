import React, { useContext } from "react";
import { Card, Nav, Row } from "react-bootstrap";
import { Context } from "../../index";
import { observer } from "mobx-react-lite";
import PatientCard from "./PatientCard";

const RequestStateContainer = observer(() => {
  const { request } = useContext(Context);
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between">
        <Nav variant="tabs" defaultActiveKey={`#${request.states[0].link}`}>
          {request.states.map((state) => (
            <Nav.Item>
              <Nav.Link
                key={state.id}
                href={`#${state.link}`}
                onClick={() => request.setSelectedState(state.status)}
              >
                {state.name}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Header>
      <Card.Body>
        <Row xxl={2} xl={2} lg={2} sm={1} xs={1} className="g-3">
          {request.getRequests.map((request) => {
            return request["EvnDirectionStatus_SysNick"] ===
              request.selectedState ? (
              <PatientCard
                key={request["EvnDirection_Num"]}
                request={request}
              />
            ) : (
              <></>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
});

export default RequestStateContainer;
