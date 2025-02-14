import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  userSeq: number | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  token: null,
  userSeq: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; userSeq: number }>
    ) {
      state.token = action.payload.token;
      state.userSeq = action.payload.userSeq;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.token = null;
      state.userSeq = null;
      state.isLoggedIn = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
