import React from "react";
import { Col, Row } from "react-bootstrap";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <Row>
      <Col sm={"auto"}>
        <SideBar />
      </Col>
      <Col>
        <Outlet />
      </Col>
    </Row>
  );
};

export default Layout;
