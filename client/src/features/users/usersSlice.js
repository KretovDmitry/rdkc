import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuth: false,
};

export const usersSlice = createSlice({
  initialState,
  name: "users",
  reducers: {
    logout: () => initialState,
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserIsAuth: (state, action) => {
      state.isAuth = action.payload;
    },
  },
});

export default usersSlice.reducer;

export const { logout, setUser, setUserIsAuth } = usersSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectUserIsAuth = (state) => state.user.isAuth;
