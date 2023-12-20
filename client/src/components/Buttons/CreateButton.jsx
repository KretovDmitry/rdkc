import React, { useEffect, useState } from "react";
import s from "./CreateButton.module.css";
import { createPatient } from "../../app/api/patientsAPI";
import { createRequests } from "../../app/api/requestsAPI";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../features/users/usersSlice";
import { createReanimationPeriods } from "../../app/api/reanimationPeriodsAPI";
import {
  selectRequestsByPatient,
  setRequestCreatedById,
} from "../../features/requests/requestsSlice";
import { selectReanimationPeriodById } from "../../features/reanimationPeriods/reanimationPeriodsSlice";
import { selectAllSchedule } from "../../features/schedules/scheduleSlice";

const CreateButton = ({ patientId, isRean, isAdult }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allSchedule = useSelector(selectAllSchedule);
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const requestsForPatient = useSelector((state) =>
    selectRequestsByPatient(state, patientId),
  );
  const rp = useSelector((state) =>
    selectReanimationPeriodById(state, patientId),
  );
  // Detects new incoming requests
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

  const handleToggle = async (
    patientId,
    allSchedule,
    requestsForPatient,
    objectValue,
    isAdult,
  ) => {
    setDisabled(true);
    setButtonClass("onClick");
    const currentStaff = allSchedule.filter((record) => {
      const now = new Date();
      return new Date(record.start) <= now && new Date(record.end) >= now;
    });
    const staffIds = {};
    for (const request of requestsForPatient) {
      if (request.status === "Queued") {
        const specialist = currentStaff.find(
          (record) =>
            record.staff.emiasSpecialty === request.specialty &&
            record.staff.forAdults === isAdult,
        );
        staffIds[request.emiasRequestNumber] = specialist
          ? specialist.staffId
          : null;
      }
    }
    try {
      const { dataValues: patient } = await createPatient(patientId);
      const { dataValues: rp } = await createReanimationPeriods(objectValue);
      const { success } = await createRequests(
        patientId,
        rp.error ? isRean : rp.isRean,
        patient.id,
        user.id,
        staffIds,
        rp.id,
      );
      if (success) {
        setButtonClass("validate");
        setDisabled(true);
        for (const request of requestsForPatient) {
          dispatch(setRequestCreatedById(request.emiasRequestNumber));
        }
      } else {
        setButtonClass(null);
        setDisabled(false);
      }
      // setTimeout(() => {
      //   const val = success ? "validate" : null;
      //   setButtonClass(val);
      //   setDisabled(false);
      // }, 1250);
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
      onClick={() =>
        handleToggle(
          patientId,
          allSchedule,
          requestsForPatient,
          rp.objectValue,
          isAdult,
        )
      }
    ></button>
  );
};

export default CreateButton;
