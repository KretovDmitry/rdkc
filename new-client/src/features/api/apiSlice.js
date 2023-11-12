import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://172.16.5.162:5000/api/" }),
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: () => "/patients",
    }),
  }),
});

export const { useGetPatientsQuery } = apiSlice;
