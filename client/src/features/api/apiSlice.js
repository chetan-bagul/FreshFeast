import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "../auth/authSlice";

// Central RTK Query API — every feature slice below injects its endpoints into this
// single instance, so caching/tags work across the whole app instead of per-feature.
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  credentials: "include", // sends the httpOnly refresh-token cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Access tokens intentionally stay out of localStorage. After a page refresh, use the
// httpOnly refresh-token cookie once and retry the request transparently.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  const refreshResult = await baseQuery({ url: "/auth/refresh-token", method: "POST" }, api, extraOptions);
  if (refreshResult.data?.accessToken && api.getState().auth.user) {
    api.dispatch(setCredentials({ user: api.getState().auth.user, accessToken: refreshResult.data.accessToken }));
    result = await baseQuery(args, api, extraOptions);
  } else {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Kitchen", "Dish", "Order", "DeliveryTask", "Admin"],
  endpoints: () => ({}),
});
