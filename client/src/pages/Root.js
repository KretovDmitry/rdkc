import React, { useContext } from "react";
import NavBar from "../components/NavBar";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import Layout from "./Layout";
import StartPage from "./StartPage/StartPage";

const Root = observer(() => {
  const { user } = useContext(Context);
  return (
    <>
      <NavBar />
      {user.isAuth ? <Layout /> : <StartPage />}
    </>
  );
});

export default Root;
