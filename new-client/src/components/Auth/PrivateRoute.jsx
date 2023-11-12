import React from "react";
import { useSelector } from "react-redux";
import { selectUserIsAuth } from "../../features/users/usersSlice";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuth = useSelector(selectUserIsAuth);
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
