import React from "react";
import { useSelector } from "react-redux";
import { selectRequestById } from "../requests/requestsSlice";

const LpuName = ({ requestId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  return <div>{request.lpu}</div>;
};

export default LpuName;
