import { createBrowserRouter } from "react-router-dom";
import Root from "./pages/Root";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import Auth from "./pages/Auth";
import Request from "./pages/Request";
import React from "react";
import { fetchRequests } from "./http/requestAPI";
import Schedule from "./pages/Schedule";
import Statistics from "./pages/Statistics";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "login",
        element: <Auth />,
      },
      {
        path: "request",
        element: <Request />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "report",
        element: <Statistics />,
      },
    ],
  },
]);
