import React, { useContext } from "react";
import { Context } from "../../../index";
import { capitalize } from "../../../utils/functions";
import { observer } from "mobx-react-lite";

const ListItem = observer(({ patient }) => {
  const { requestStore } = useContext(Context);
  console.log("ListItem was rendered at", new Date().toLocaleTimeString());

  return (
    <button
      type="button"
      className={"list-group-item list-group-item-action list-group-item-light"}
      onClick={() => {
        requestStore.setSelectedPatient(patient["Person_id"]);
        console.log(requestStore.selectedPatient);
      }}
    >
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{capitalize(patient["Person_FIO"])}</h5>
        <small>
          {patient["EvnDirection_insTime"] +
            "\t" +
            patient["EvnDirection_insDate"]}
        </small>
      </div>
      <p className="mb-1">{patient["Lpu_Nick"]}</p>
      <small>{patient["Diag_FullName"]}</small>
    </button>
  );
});

export default ListItem;
