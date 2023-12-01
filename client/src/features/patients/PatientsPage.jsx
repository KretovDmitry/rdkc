import React, { useEffect } from "react";
import SelectRequestsStatus from "../requests/SelectRequestsStatus";
import PatientsList from "./PatientsList";
import s from "./Patients.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentMonth,
  selectStaffForToday,
} from "../schedules/scheduleSlice";
import { fetchPatients, selectPatientsLoadingStatus } from "./patientsSlice";
import { fetchRequests } from "../requests/requestsSlice";
import { fetchReanimationPeriods } from "../reanimationPeriods/reanimationPeriodsSlice";
import { Spinner } from "../../components/Spinner/Spinner";

const PatientsPage = () => {
  const dispatch = useDispatch();
  const patientsLoadingStatus = useSelector(selectPatientsLoadingStatus);
  useEffect(() => {
    if (patientsLoadingStatus === "idle") {
      dispatch(fetchPatients());
      dispatch(fetchRequests());
      dispatch(fetchReanimationPeriods());
      dispatch(fetchCurrentMonth());
    }
  }, [patientsLoadingStatus, dispatch]);

  let content;

  if (patientsLoadingStatus === "loading") {
    content = <Spinner />;
  } else {
    content = (
      <div className={s.container}>
        <section className={s.patientsList}>
          <SelectRequestsStatus />
          <PatientsList />
        </section>
      </div>
    );
  }
  return content;
};

export default PatientsPage;
