import { $host } from './index'

export const fetchRequests = async () => {
  const { data } = await $host.get('api/requests')
  return data
}
