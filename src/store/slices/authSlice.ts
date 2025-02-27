import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDTO } from "../../dtos/UserDTO";

interface AuthState {
  userInfo: UserDTO | null;
}

const initialState: AuthState = {
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<UserDTO>) {
      state.userInfo = action.payload;
    },
    clearUserInfo(state) {
      state.userInfo = null;
    },
  },
});

export const { setUserInfo, clearUserInfo } = authSlice.actions;
export default authSlice.reducer;
