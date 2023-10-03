import React from "react";
import { NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

const SideBar = () => {
  return (
    <Nav className="flex-column ps-3 pt-3 pe-1">
      <NavLink to={"/request"} className={"pb-2"}>
        Заявки
      </NavLink>
      <NavLink to={"/schedule"} className={"pb-2"}>
        Расписание
      </NavLink>
      <NavLink to={"/report"} className={"pb-2"}>
        Статистика
      </NavLink>
    </Nav>
  );
};

export default SideBar;
