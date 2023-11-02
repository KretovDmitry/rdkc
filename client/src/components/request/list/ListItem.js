import React, { useContext } from "react";
import { Context } from "../../../index";
import { capitalize } from "../../../utils/functions";
import { observer } from "mobx-react-lite";
import { action } from "mobx";

const ListItem = observer(({ patient }) => {
  const { requestStore } = useContext(Context);
  console.log("ListItem was rendered at", new Date().toLocaleTimeString());
  const patientId = patient["Person_id"];
  console.log(patientId);
  // const diagnosis = patient["Diag_FullName"].map((d) => <small>{d}</small>);
  // const specialties = patient["LpuSectionProfile_Name"].map((s) => (
  //   <small className={"rounded-5 fw-semibold"}>
  //     <li className="list-group-item list-group-item-dark ps-2 pe-2 pt-1 pb-1">
  //       {s}
  //     </li>
  //   </small>
  // ));
  return (
    <button
      type="button"
      className={"list-group-item list-group-item-action list-group-item-light"}
      onClick={action((e) => {
        requestStore.setSelectedPatient(patientId);
        e.preventDefault();
      })}
    >
      <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{capitalize(patient["Person_FIO"])}</h5>
        <small>
          {patient["EvnDirection_insTime"] +
            " " +
            patient["EvnDirection_insDate"]}
        </small>
      </div>
      <div className="d-flex w-100 justify-content-between">
        <div>
          <p className="mb-1">{patient["Lpu_Nick"]}</p>
          {/*<small>{diagnosis}</small>*/}
        </div>
        <div>{/*<ul className="list-group">{specialties}</ul>*/}</div>
      </div>
    </button>
  );
});

export default ListItem;
