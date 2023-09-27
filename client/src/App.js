import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import Root from "./pages/Root";
import Auth from "./pages/Auth";
import Layout from "./pages/Layout";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import Request from "./pages/Request";

const router = createBrowserRouter([
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
        path: "home",
        element: <Layout />,
      },
      {
        path: "request",
        element: <Request />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
