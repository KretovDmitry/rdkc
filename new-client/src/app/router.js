import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../components/Error/ErrorPage";
import { ADMIN_ROUTE, HOME_ROUTE, REQUESTS_ROUTE } from "../utils/consts";
import AdminPage from "../features/admin/AdminPage";
import PatientsPage from "../features/patients/PatientsPage";
import Layout from "../components/Layout/Layout";
import Auth from "../components/Auth/Auth";

export const router = createBrowserRouter([
  {
    path: HOME_ROUTE,
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Auth /> },
      {
        path: ADMIN_ROUTE,
        element: <AdminPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: REQUESTS_ROUTE,
        element: <PatientsPage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
]);
