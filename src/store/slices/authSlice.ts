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
    updateProfileImg(state, action: PayloadAction<string>) {
      if (state.userInfo) {
        state.userInfo.userProfileImg = action.payload;
      }
    },
    clearUserInfo(state) {
      state.userInfo = null;
    },
  },
});

export const { setUserInfo, clearUserInfo, updateProfileImg } =
  authSlice.actions;
export default authSlice.reducer;
