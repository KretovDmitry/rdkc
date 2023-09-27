import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <Nav defaultActiveKey="/request" className="flex-column ps-3 pt-3 pe-1">
      <Link to={"/request"} className={"pb-2"}>
        Заявки
      </Link>
      <Link to={"/schedule"} className={"pb-2"}>
        Расписание
      </Link>
      <Link to={"/report"} className={"pb-2"}>
        Статистика
      </Link>
    </Nav>
  );
};

export default SideBar;
