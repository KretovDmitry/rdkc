import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { Context } from "../../index";
import { observer } from "mobx-react-lite";

const RequestsStatesSelectorNav = observer(() => {
  const { requestStore } = useContext(Context);
  console.log("1", requestStore.selectedState);
  const requestsStatesSelector = requestStore.states.map((state) => (
    <button
      key={state.id}
      type="button"
      className="btn btn-success"
      onClick={() => {
        requestStore.setSelectedState(state.state);
        // console.log(state.selectedState);
        // console.log(state.state);
      }}
    >
      {state.name}
    </button>

    // <li className="nav-item" key={state.id}>
    //   <Button
    //     variant="outline-secondary"
    //     size="sm"
    //     className={"me-2 mb-2"}
    //     onClick={() => {
    //       requestStore.setSelectedState(state.state);
    //       console.log(state.selectedState);
    //       console.log(state.state);
    //     }}
    //   >
    //     {state.name}
    //   </Button>
    // </li>
  ));

  return (
    <Card.Header className="d-flex flex-row">
      <div className="btn-group btn-group-sm" role="group">
        {requestsStatesSelector}
      </div>
    </Card.Header>
  );
});

export default RequestsStatesSelectorNav;
