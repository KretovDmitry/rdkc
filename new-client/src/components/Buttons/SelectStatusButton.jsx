import React from "react";
import { setSelectedStatus } from "../../features/requests/requestsSlice";
import s from "./SelectStatusButton.module.css";
import { useDispatch } from "react-redux";

const SelectStatusButton = ({ text, statusValue }) => {
  const dispatch = useDispatch();
  return (
    <button
      className={s.glowOnHover}
      type="button"
      onClick={() => dispatch(setSelectedStatus(statusValue))}
    >
      {text}
    </button>
  );
};

export default SelectStatusButton;
