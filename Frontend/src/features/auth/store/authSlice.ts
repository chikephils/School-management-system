import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../../types/auth";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
};

type LoginSuccessPayload = {
  user: AuthUser;
  accessToken: string;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
