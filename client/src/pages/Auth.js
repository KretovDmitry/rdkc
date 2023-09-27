import React from "react";
import { Button, Card, Form } from "react-bootstrap";

const Auth = () => {
  return (
    <div
      className={"d-flex justify-content-center align-items-center"}
      style={{
        height: window.innerHeight - 56,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <Card style={{ width: 500 }} className="p-5" data-bs-theme="dark">
        <h3 className="m-auto">Авторизация</h3>
        <Form className="d-flex flex-column">
          <Form.Control className="mt-3" placeholder="Логин" />
          <Form.Control className="mt-3" placeholder="Пароль" />
          <Button variant="outline-success" className="mt-3 align-self-end">
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Auth;
