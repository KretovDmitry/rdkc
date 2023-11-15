import React, { useState } from "react";
import s from "./CreateButton.module.css";
import { createPatient } from "../../app/api/patientsAPI";
import { createRequests } from "../../app/api/requestsAPI";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/users/usersSlice";
import { createReanimationPeriods } from "../../app/api/reanimationPeriodsAPI";

const CreateButton = ({ patientId, isRean }) => {
  const user = useSelector(selectUser);
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const handleToggle = async () => {
    setDisabled(true);
    setButtonClass("onClick");
    try {
      const response = await createPatient(patientId);
      const responseRP = await createReanimationPeriods(patientId);
      await createRequests(
        patientId,
        isRean,
        response.id,
        user.id,
        1,
        responseRP.id,
      );
      setTimeout(() => {
        setButtonClass("validate");
      }, 1250);
    } catch (e) {
      setButtonClass(null);
      setDisabled(false);
      console.error(e);
    }
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
