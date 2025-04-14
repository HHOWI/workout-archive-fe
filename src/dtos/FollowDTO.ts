/**
 * 팔로우 카운트 응답 DTO
 * 사용자의 팔로우/팔로워/팔로우한 장소 수를 표현합니다.
 */
export interface FollowCountDTO {
  followingCount: number;
  followerCount: number;
  followingPlaceCount: number;
}

/**
 * 팔로워 정보 응답 DTO
 * 사용자를 팔로우하는 다른 사용자 정보를 표현합니다.
 */
export interface FollowerDTO {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string;
}

/**
 * 팔로잉 정보 응답 DTO
 * 사용자가 팔로우하는 다른 사용자 정보를 표현합니다.
 */
export interface FollowingDTO {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string;
}

/**
 * 팔로잉한 장소 정보 응답 DTO
 * 사용자가 팔로우하는 장소 정보를 표현합니다.
 */
export interface FollowingPlaceDTO {
  workoutPlaceSeq: number;
  placeName: string;
  addressName: string;
}

/**
 * 사용자 팔로우 요청 DTO
 * 다른 사용자를 팔로우할 때 사용되는 요청 데이터입니다.
 */
export interface UserFollowRequestDTO {
  followingUserSeq: number;
}

/**
 * 장소 팔로우 요청 DTO
 * 장소를 팔로우할 때 사용되는 요청 데이터입니다.
 */
export interface PlaceFollowRequestDTO {
  workoutPlaceSeq: number;
}

/**
 * 팔로우 상태 응답 DTO
 * 팔로우 여부를 표현합니다.
 */
export interface FollowStatusDTO {
  isFollowing: boolean;
}

/**
 * 장소 팔로워 수 응답 DTO
 * 특정 장소의 팔로워 수를 표현합니다.
 */
export interface PlaceFollowerCountDTO {
  count: number;
}
