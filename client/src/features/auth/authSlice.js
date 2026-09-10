import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("ff_user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    accessToken: null, // access tokens are short-lived and kept in memory only, not localStorage
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      localStorage.setItem("ff_user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("ff_user");
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("ff_user", JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
