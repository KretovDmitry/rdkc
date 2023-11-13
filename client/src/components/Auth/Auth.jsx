import React, { useState } from "react";
import s from "./Auth.module.css";
import { login } from "../../app/api/userAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setUserIsAuth } from "../../features/users/usersSlice";

const Auth = () => {
  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const signIn = async (event) => {
    event.preventDefault();
    try {
      const user = await toast.promise(login(userLogin, password), {
        pending: {
          render() {
            return "Авторизуюсь...";
          },
        },
        success: {
          render() {
            return "Авторизация прошла успешно 👌";
          },
        },
        error: {
          render(response) {
            return `${
              response?.data?.response?.data?.message ||
              response?.messages ||
              response?.data ||
              "Произошла ошибка"
            } 🤯`;
          },
        },
      });
      setUserLogin("");
      setPassword("");
      dispatch(setUser(user));
      dispatch(setUserIsAuth(true));
      navigate("/requests");
    } catch (e) {
      setUserLogin("");
      setPassword("");
    }
  };

  return (
    <div className={s.container}>
      <div className={s.auth}>
        <p>Авторизуйтесь для доступа к приложению</p>
        <form onSubmit={(e) => signIn(e)}>
          <div className={s.authDiv}>
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              type="text"
              placeholder="Введите логин"
              value={userLogin}
              onChange={(e) => setUserLogin(e.target.value)}
              required
            />
          </div>
          <div className={s.authDiv}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={s.authDiv}>
            <input type="submit" value="Войти" />
          </div>
        </form>{" "}
        <ToastContainer position="bottom-left" autoClose={3000} closeOnClick />
      </div>
    </div>
  );
};

export default Auth;
