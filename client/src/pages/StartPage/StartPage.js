import React from "react";
import image from "./start.jpg";
import s from "./StartPage.module.css";

const StartPage = () => {
  return (
    <div className={s.startPage}>
      <img
        className={s.noselect}
        src={image}
        alt="Статовая эмблема МОНИКИ"
        style={{ height: 500, width: 500 }}
      />
    </div>
  );
};

export default StartPage;
