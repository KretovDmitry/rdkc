import React, { useState } from "react";
import s from "./CreateButton.module.css";
import { createPatient } from "../../http/patientsAPI";

const CreateButton = ({ patientId }) => {
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const handleToggle = async () => {
    setDisabled(true);
    setButtonClass("onClick");
    const success = await createPatient(patientId);
    setTimeout(() => {
      success ? setButtonClass("validate") : setButtonClass(null);
    }, 1250);
  };
  return (
    <button
      className={`${s.button} ${s[buttonClass]}`}
      disabled={disabled}
      onClick={handleToggle}
    ></button>
  );
};

export default CreateButton;
