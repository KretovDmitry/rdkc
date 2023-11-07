import axios from "axios";

export const client = axios.create({
  baseURL: "http://172.16.5.162:5000/",
});
