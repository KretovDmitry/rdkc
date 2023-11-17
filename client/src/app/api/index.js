import axios from "axios";
const baseURL = "http://172.16.5.162:5000/api";
export const client = axios.create({
  baseURL: baseURL,
});
export const authClient = axios.create({
  baseURL: baseURL,
});
const authInterceptor = (config) => {
  config.headers.authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
};

authClient.interceptors.request.use(authInterceptor);
