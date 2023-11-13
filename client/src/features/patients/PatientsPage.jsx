import React from "react";
import SelectRequestsStatus from "../requests/SelectRequestsStatus";
import PatientsList from "./PatientsList";
import s from "./Patients.module.css";

const PatientsPage = () => {
  return (
    <section className={s.patientsList}>
      <SelectRequestsStatus />
      <PatientsList />
    </section>
  );
};

export default PatientsPage;
