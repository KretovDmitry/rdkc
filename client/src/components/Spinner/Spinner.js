import React from "react";
import s from "./Spinner.module.css";

export const Spinner = ({ text = "", size = "5em" }) => {
  const header = text ? <h4>{text}</h4> : null;
  return (
    <div className={s.spinner}>
      {header}
      <div className={s.loader} style={{ height: size, width: size }} />
    </div>
  );
};
