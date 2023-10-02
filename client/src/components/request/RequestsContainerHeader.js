import React, { useContext } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { Context } from "../../index";

const RequestsContainerHeader = () => {
  const { requestStore } = useContext(Context);

  return (
    <Card.Header className="d-flex flex-row">
      {/*<div>*/}
      {/*  {request.states.map((state) => (*/}
      {/*    <Button*/}
      {/*      key={state.id}*/}
      {/*      onClick={(e) => {*/}
      {/*        e.preventDefault();*/}
      {/*        request.setSelectedState(state.state);*/}
      {/*      }}*/}
      {/*      // href={`/request/#${state.link}`}*/}
      {/*      variant="outline-info"*/}
      {/*      size="sm"*/}
      {/*      className={"me-2"}*/}
      {/*    >*/}
      {/*      {state.name}*/}
      {/*    </Button>*/}
      {/*  ))}*/}
      {/*</div>*/}
      <ListGroup>
        {requestStore.states.map((state) => (
          <ListGroup.Item
            key={state.id}
            onClick={() => requestStore.setSelectedState(state.state)}
            active={state.id === requestStore.selectedState.id}
          >
            {state.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card.Header>
  );
};

export default RequestsContainerHeader;
