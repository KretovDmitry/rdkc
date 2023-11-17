import React from "react";
import SelectRequestsStatus from "../requests/SelectRequestsStatus";
import PatientsList from "./PatientsList";
import s from "./Patients.module.css";
import { useSelector } from "react-redux";
import { selectStaffForToday } from "../schedules/scheduleSlice";

const PatientsPage = () => {
  const todayStaff = useSelector(selectStaffForToday);
  console.log(todayStaff);
  return (
    <div className={s.container}>
      <section className={s.patientsList}>
        <SelectRequestsStatus />
        <PatientsList todayStaff={todayStaff} />
      </section>
    </div>
  );
};

export default PatientsPage;
