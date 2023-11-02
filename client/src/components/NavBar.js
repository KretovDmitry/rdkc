import React, { useContext } from "react";
import { Context } from "../index";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { HOME_ROUTE } from "../utils/consts";
import { observer } from "mobx-react-lite";

const NavBar = observer(() => {
  const { user } = useContext(Context);
  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top">
      <Container fluid={"lg"}>
        <Navbar.Brand href={HOME_ROUTE}>RDKC</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user.isAuth ? (
            <Nav className="ms-auto">
              <Button variant="outline-info" size="sm" className={"me-2"}>
                Админ панель
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => user.setIsAuth(false)}
              >
                Выйти
              </Button>
            </Nav>
          ) : (
            <Nav className="ms-auto">
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => user.setIsAuth(true)}
              >
                Авторизация
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

export default NavBar;
