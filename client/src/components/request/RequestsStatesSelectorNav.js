import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import { Context } from "../../index";
import { observer } from "mobx-react-lite";

const RequestsStatesSelectorNav = observer(() => {
  const { requestStore } = useContext(Context);
  const requestsStatesSelector = requestStore.states.map((state) => (
    <button
      key={state.id}
      type="button"
      className={`btn ${state.btn}`}
      onClick={() => requestStore.setSelectedState(state.state)}
    >
      {state.name}
      <span className="badge bg-opacity-100 rounded-pill ">14</span>
    </button>
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
