import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/users",
});

export const loginUser = async (userId: string, userPw: string) => {
  return await instance.post("/login", { userId, userPw });
};
