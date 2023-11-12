import React from "react";
import SideBar from "../SideBar/SideBar";
import { Outlet } from "react-router-dom";
import s from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={s.layout}>
      <div className={s.sidebar}>
        <SideBar />
      </div>
      <div className={s.main}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
