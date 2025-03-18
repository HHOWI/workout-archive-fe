import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../schema/UserSchema";

// 요청 데이터 타입 (로그인, 회원가입)
export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;

export interface UserInfoDTO {
  userSeq: number;
  userNickname: string;
}
