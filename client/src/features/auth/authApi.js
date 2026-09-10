import { apiSlice } from "../api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getProfile: builder.query({ query: () => "/auth/me" }),
    updateProfile: builder.mutation({ query: (body) => ({ url: "/auth/me", method: "PATCH", body }) }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useGetProfileQuery, useUpdateProfileMutation } = authApi;
