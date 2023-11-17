import React, { useEffect, useState } from "react";
import s from "./CreateButton.module.css";
import { createPatient } from "../../app/api/patientsAPI";
import { createRequests } from "../../app/api/requestsAPI";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/users/usersSlice";
import { createReanimationPeriods } from "../../app/api/reanimationPeriodsAPI";
import { selectRequestsByPatient } from "../../features/requests/requestsSlice";

const CreateButton = ({ patientId, isRean, todayStaff }) => {
  const user = useSelector(selectUser);
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const requestsForPatient = useSelector((state) =>
    selectRequestsByPatient(state, patientId),
  );
  let isCreated = true;
  for (const request of requestsForPatient) {
    if (!request.isCreated) {
      isCreated = false;
      break;
    }
  }
  useEffect(() => {
    if (isCreated) {
      setDisabled(true);
      setButtonClass("validate");
    }
  }, [isCreated]);

  const handleToggle = async (todayStaff, requestsForPatient) => {
    setDisabled(true);
    setButtonClass("onClick");
    const currentStaff = todayStaff.filter((record) => {
      const now = new Date();
      return new Date(record.start) <= now && new Date(record.end) >= now;
    });
    const staffIds = {};
    for (const request of requestsForPatient) {
      const specialist = currentStaff.find(
        (record) => record.staff.emiasSpecialty === request.specialty,
      );
      staffIds[request.emiasRequestNumber] = specialist.staffId;
    }
    try {
      const response = await createPatient(patientId);
      const responseRP = await createReanimationPeriods(patientId);
      await createRequests(
        patientId,
        isRean,
        response.id,
        user.id,
        staffIds,
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
      onClick={() => handleToggle(todayStaff, requestsForPatient)}
    ></button>
  );
};

export default CreateButton;
