import { authClient, client } from "./index";
import { jwtDecode } from "jwt-decode";

export const registration = async (login, password) => {
  const { data } = await client.post("user/registration", {
    login,
    password,
  });
  localStorage.setItem("token", data.token);
  return jwtDecode(data.token);
};
export const login = async (login, password) => {
  const { data } = await client.post("user/login", { login, password });
  localStorage.setItem("token", data.token);
  return jwtDecode(data.token);
};
export const check = async () => {
  const { data } = await authClient.get("user/auth");
  localStorage.setItem("token", data.token);
  return jwtDecode(data.token);
};
