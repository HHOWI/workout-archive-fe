import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfoDTO } from "../../dtos/UserDTO";

interface AuthState {
  userInfo: UserInfoDTO | null;
}

const initialState: AuthState = {
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<UserInfoDTO>) {
      state.userInfo = action.payload;
    },
    clearUserInfo(state) {
      state.userInfo = null;
    },
  },
});

export const { setUserInfo, clearUserInfo } = authSlice.actions;
export default authSlice.reducer;
