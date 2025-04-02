import { authAPI, publicAPI } from "./axiosConfig";
import {
  FollowCountDTO,
  FollowerDTO,
  FollowingDTO,
  FollowingPlaceDTO,
  FollowStatusDTO,
} from "../dtos/FollowDTO";

// 사용자 팔로우
export const followUserAPI = async (
  followingUserSeq: number
): Promise<void> => {
  await authAPI.post("/follow/user", { followingUserSeq });
};

// 사용자 언팔로우
export const unfollowUserAPI = async (
  followingUserSeq: number
): Promise<void> => {
  await authAPI.delete(`/follow/user/${followingUserSeq}`);
};

// 장소 팔로우
export const followPlaceAPI = async (
  workoutPlaceSeq: number
): Promise<void> => {
  await authAPI.post("/follow/place", { workoutPlaceSeq });
};

// 장소 언팔로우
export const unfollowPlaceAPI = async (
  workoutPlaceSeq: number
): Promise<void> => {
  await authAPI.delete(`/follow/place/${workoutPlaceSeq}`);
};

// 팔로워 목록 조회
export const getFollowersAPI = async (
  userSeq: number
): Promise<FollowerDTO[]> => {
  const response = await publicAPI.get(`/follow/followers/${userSeq}`);
  return response.data;
};

// 팔로잉 목록 조회
export const getFollowingAPI = async (
  userSeq: number
): Promise<FollowingDTO[]> => {
  const response = await publicAPI.get(`/follow/following/${userSeq}`);
  return response.data;
};

// 팔로잉 장소 목록 조회
export const getFollowingPlacesAPI = async (
  userSeq: number
): Promise<FollowingPlaceDTO[]> => {
  const response = await publicAPI.get(`/follow/place/${userSeq}`);
  return response.data;
};

// 팔로우 카운트 조회
export const getFollowCountsAPI = async (
  userSeq: number
): Promise<FollowCountDTO> => {
  const response = await publicAPI.get(`/follow/counts/${userSeq}`);
  return response.data;
};

// 사용자 팔로우 상태 확인
export const checkUserFollowStatusAPI = async (
  followingUserSeq: number
): Promise<boolean> => {
  const response = await authAPI.get<FollowStatusDTO>(
    `/follow/status/user/${followingUserSeq}`
  );
  return response.data.isFollowing;
};

// 장소 팔로우 상태 확인
export const checkPlaceFollowStatusAPI = async (
  workoutPlaceSeq: number
): Promise<boolean> => {
  const response = await authAPI.get<FollowStatusDTO>(
    `/follow/status/place/${workoutPlaceSeq}`
  );
  return response.data.isFollowing;
};

// 장소 팔로워 수 조회
export const getPlaceFollowerCountAPI = async (
  workoutPlaceSeq: number
): Promise<number> => {
  const response = await publicAPI.get<{ count: number }>(
    `/follow/count/place/${workoutPlaceSeq}`
  );
  return response.data.count;
};
