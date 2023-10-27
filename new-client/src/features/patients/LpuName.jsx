import React from "react";
import { useSelector } from "react-redux";
import { selectRequestById } from "../requests/requestsSlice";
import s from "./Patients.module.css";

const LpuName = ({ requestId }) => {
  const request = useSelector((state) => selectRequestById(state, requestId));
  return <div className={s.lpuName}>{request.lpu}</div>;
};

export default LpuName;
