export interface RegisterDTO {
  userId: string;
  userPw: string;
  userNickname: string;
  userEmail: string;
}

export interface LoginDTO {
  userId: string;
  userPw: string;
}

export interface UserInfoDTO {
  userSeq: number;
  userNickname: string;
}
