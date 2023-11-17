import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setUserIsAuth } from "./features/users/usersSlice";
import { check } from "./app/api/userAPI";
import { Spinner } from "./components/Spinner/Spinner";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Auth from "./components/Auth/Auth";
import PatientsPage from "./features/patients/PatientsPage";
import SideBar from "./components/SideBar/SideBar";
import Plug from "./components/Error/Plug";
import SchedulePage from "./features/schedules/SchedulePage";
import {
  ADMIN_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  REQUESTS_ROUTE,
  SCHEDULE_ROUTE,
  STATISTICS_ROUTE,
} from "./utils/consts";
import { fetchCurrentMonth } from "./features/schedules/scheduleSlice";
import { fetchReanimationPeriods } from "./features/reanimationPeriods/reanimationPeriodsSlice";
import { fetchRequests } from "./features/requests/requestsSlice";
function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    check()
      .then((user) => {
        dispatch(setUser(user));
        dispatch(setUserIsAuth(true));
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
    dispatch(fetchRequests());
    dispatch(fetchReanimationPeriods());
    dispatch(fetchCurrentMonth());
  }, [dispatch]);

  if (loading) return <Spinner />;

  return (
    <Router>
      <>
        <SideBar />
        <Routes>
          <Route path={HOME_ROUTE} element={<PrivateRoute />}>
            <Route path={HOME_ROUTE} element={<Plug />} />
            <Route path={REQUESTS_ROUTE} element={<PatientsPage />} />
            <Route path={SCHEDULE_ROUTE} element={<SchedulePage />} />
            <Route path={STATISTICS_ROUTE} element={<Plug />} />
            <Route path={ADMIN_ROUTE} element={<Plug />} />
          </Route>
          <Route path={LOGIN_ROUTE} element={<Auth />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
