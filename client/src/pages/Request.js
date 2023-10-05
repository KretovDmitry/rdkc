import React, { useContext, useEffect } from "react";
import { fetchRequests } from "../http/requestAPI";
import RequestsContainer from "../components/request/RequestsContainer";
import { Context } from "../index";

const Request = () => {
  const { requestStore } = useContext(Context);

  useEffect(() => {
    fetchRequests().then((data) => requestStore.setRequests(data));
  });

  return <RequestsContainer />;
};

export default Request;
