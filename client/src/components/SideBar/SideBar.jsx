import React from "react";
import { useNavigate } from "react-router-dom";
import s from "./SideBar.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  selectUserIsAuth,
  setUser,
  setUserIsAuth,
} from "../../features/users/usersSlice";

const SideBar = () => {
  const navigate = useNavigate();
  const isAuth = useSelector(selectUserIsAuth);
  const dispatch = useDispatch();
  const logOut = () => {
    localStorage.removeItem("token");
    dispatch(setUser(null));
    dispatch(setUserIsAuth(false));
  };

  return (
    <nav className={s.menu} tabIndex="0">
      <div className={s.smartphoneMenuTrigger}></div>
      <header className={s.logo}>
        <h2>РДКЦ</h2>
      </header>
      <ul>
        <li
          tabIndex="0"
          className={s.iconDashboard}
          onClick={() => navigate("/")}
        >
          <span>Главная</span>
        </li>
        <li
          tabIndex="0"
          className={s.requests}
          onClick={() => navigate("/requests")}
        >
          <span>Заявки</span>
        </li>
        <li
          tabIndex="0"
          className={s.schedule}
          onClick={() => navigate("/schedule")}
        >
          <span>Расписание</span>
        </li>
        <li
          tabIndex="0"
          className={s.statistics}
          onClick={() => navigate("/statistics")}
        >
          <span>Статистика</span>
        </li>
        <li tabIndex="0" className={s.admin} onClick={() => navigate("/admin")}>
          <span>Админ</span>
        </li>
        {isAuth && (
          <li tabIndex="0" className={s.exit} onClick={logOut}>
            <span>Выйти</span>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default SideBar;
