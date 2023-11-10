import { $host } from './index'

export const registration = async (login, password) => {
  return await $host.post('api/user/register', { login, password })
}
export const login = async (login, password) => {
  return await $host.post('api/user/login', { login, password })
}
export const check = async (login, password) => {
  return await $host.post('api/user/auth', { login, password })
}
