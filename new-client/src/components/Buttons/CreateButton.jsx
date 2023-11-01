import React, { useState } from "react";
import s from "./CreateButton.module.css";
import { createPatient } from "../../http/patientsAPI";

const CreateButton = ({ patientId }) => {
  console.log(patientId);
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const handleToggle = async () => {
    setDisabled(true);
    setButtonClass("onClick");
    await createPatient(patientId);
    setTimeout(() => {
      setButtonClass("validate");
    }, 2250);
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
