import React, { useState } from "react";
import s from "./CreateButton.module.css";

const CreateButton = () => {
  const [buttonClass, setButtonClass] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const handleToggle = async () => {
    setDisabled(true);
    setButtonClass("onClick");
    setTimeout(() => {
      setButtonClass("validate");
      setTimeout(() => {
        setButtonClass(null);
      }, 1250);
    }, 2250);
  };
  return (
    <button
      className={`${s.button} ${s[buttonClass]}`}
      disabled={disabled}
      onClick={handleToggle}
    ></button>
  );
};

export default CreateButton;
