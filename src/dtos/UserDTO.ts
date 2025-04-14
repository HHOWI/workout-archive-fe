import { z } from "zod";
import { LoginSchema, RegisterSchema } from "../schema/UserSchema";

/**
 * 인증 관련 DTO
 */

// 로그인 요청 DTO
export type LoginDTO = z.infer<typeof LoginSchema>;

// 회원가입 요청 DTO
export type RegisterDTO = z.infer<typeof RegisterSchema>;

/**
 * 사용자 정보 관련 DTO
 */

// 사용자 기본 정보 응답 DTO
export interface UserInfoDTO {
  userSeq: number;
  userNickname: string;
}

// 사용자 프로필 정보 응답 DTO
export interface ProfileInfoDTO {
  userNickname: string;
  userSeq: number;
  imageUrl: string;
  workoutCount: number;
  isOwner: boolean;
  followCounts: {
    followerCount: number;
    followingCount: number;
  };
}
