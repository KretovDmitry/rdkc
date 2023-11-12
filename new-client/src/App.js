import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setUserIsAuth } from "./features/users/usersSlice";
import { check } from "./http/userAPI";
import { Spinner } from "./components/Spinner/Spinner";
import PrivateRoute from "./components/Auth/PrivateRoute";
import Auth from "./components/Auth/Auth";
import PatientsPage from "./features/patients/PatientsPage";
import SideBar from "./components/SideBar/SideBar";
import Plug from "./components/Error/Plug";
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
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <Router>
      <>
        <SideBar />
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Plug />} />
            <Route path="requests" element={<PatientsPage />} />
            <Route path="schedule" element={<Plug />} />
            <Route path="statistics" element={<Plug />} />
            <Route path="admin" element={<Plug />} />
          </Route>
          <Route path="login" element={<Auth />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
