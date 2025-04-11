export interface FollowCountDTO {
  followingCount: number;
  followerCount: number;
  followingPlaceCount: number;
}

export interface FollowerDTO {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string;
}

export interface FollowingDTO {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string;
}

export interface FollowingPlaceDTO {
  workoutPlaceSeq: number;
  placeName: string;
  addressName: string;
}

export interface UserFollowRequestDTO {
  followingUserSeq: number;
}

export interface PlaceFollowRequestDTO {
  workoutPlaceSeq: number;
}

export interface FollowStatusDTO {
  isFollowing: boolean;
}
