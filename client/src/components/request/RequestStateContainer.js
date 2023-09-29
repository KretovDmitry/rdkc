import React, { useContext, useEffect } from "react";
import { Card, Nav, Row } from "react-bootstrap";
import { Context } from "../../index";
import { observer } from "mobx-react-lite";
import PatientCard from "./PatientCard";
import { sortRequests } from "../../utils/functions";
import { fetchRequests } from "../../http/requestAPI";

const RequestStateContainer = observer(() => {
  const { request } = useContext(Context);

  // useEffect(() => {
  //   fetchRequests().then((data) => request.setRequests(data));
  // });

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between">
        <Nav variant="tabs" defaultActiveKey={request.states[0].link}>
          {request.states.map((state) => (
            <Nav.Item key={state.id}>
              <Nav.Link
                onClick={(e) => {
                  e.preventDefault();
                  request.setSelectedState(state.state);
                }}
                href={`/request/#${state.link}`}
              >
                {state.name}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        {/*<ListGroup>*/}
        {/*  {request.states.map((state) => (*/}
        {/*    <ListGroup.Item*/}
        {/*      key={state.id}*/}
        {/*      onClick={() => request.setSelectedState(state.state)}*/}
        {/*      active={state.id === request.selectedState.id}*/}
        {/*    >*/}
        {/*      {state.name}*/}
        {/*    </ListGroup.Item>*/}
        {/*  ))}*/}
        {/*</ListGroup>*/}
      </Card.Header>
      <Card.Body>
        <Row xxl={2} xl={2} lg={2} sm={1} xs={1} className="g-3">
          {sortRequests(request.getRequests, request.selectedState).map(
            (request) => {
              return (
                <PatientCard
                  key={`${request["EvnDirection_id"]}`}
                  request={request}
                />
              );
            },
          )}
        </Row>
      </Card.Body>
    </Card>
  );
});

export default RequestStateContainer;
