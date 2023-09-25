import React from "react";
import { Routes, Route, RedirectFunction } from "react-router-dom";
import { authRoutes, publicRoutes } from "../routes";
import Requests from "../pages/Requests";

const AppRouter = () => {
  const isAuth = true;
  return (
    <Routes>
      {isAuth &&
        authRoutes.map(({ path, Component }) => (
          <Route key={path} path={path} Component={Component} />
        ))}
      {publicRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} Component={Component} />
      ))}
    </Routes>
  );
};

export default AppRouter;
