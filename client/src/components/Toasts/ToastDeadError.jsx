import React from "react";
import { toast, ToastContainer } from "react-toastify";

const ToastDeadError = ({ deadName }) => {
  toast.error(`${deadName} переведён из реанимации с исходом: Смерть!`, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
  return <ToastContainer />;
};

export default ToastDeadError;
