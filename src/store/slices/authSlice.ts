import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  userSeq: number;
  profileImageUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
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
      state.user = { userSeq: action.payload.userSeq };
      state.isLoggedIn = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
