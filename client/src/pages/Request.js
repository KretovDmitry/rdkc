import React, { useContext, useEffect } from "react";
import RequestsContainer from "../components/request/RequestsContainer";
import { fetchRequests } from "../http/requestAPI";
import { Context } from "../index";

const Request = () => {
  const { requestStore } = useContext(Context);

  useEffect(() => {
    fetchRequests().then((data) => requestStore.setRequests(data));
  });

  return <RequestsContainer />;
};

export default Request;
