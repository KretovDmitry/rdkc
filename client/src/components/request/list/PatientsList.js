import React, { useContext } from "react";
import { Context } from "../../../index";
import { sortRequestsByStatus } from "../../../utils/functions";
import ListItem from "./ListItem";
import { observer } from "mobx-react-lite";

const PatientsList = observer(() => {
  const { requestStore } = useContext(Context);
  console.log("PatientsList was rendered at", new Date().toLocaleTimeString());
  console.log(
    "requestStore.getRequests.length =",
    requestStore.getRequests.length,
  );
  console.log("requestStore.selectedPatient =", requestStore.selectedPatient);

  const sortedRequests = sortRequestsByStatus(
    requestStore.getRequests,
    requestStore.selectedState,
  ).map((request) => {
    return <ListItem key={`${request["EvnDirection_id"]}`} patient={request} />;
  });

  return <div className="list-group">{sortedRequests}</div>;
});

export default PatientsList;
