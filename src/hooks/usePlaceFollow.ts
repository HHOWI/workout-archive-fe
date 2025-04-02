import { useState, useEffect, useCallback } from "react";
import {
  followPlaceAPI,
  unfollowPlaceAPI,
  checkPlaceFollowStatusAPI,
  getPlaceFollowerCountAPI,
} from "../api/follow";

/**
 * 장소 팔로우 관련 기능을 제공하는 커스텀 훅
 * @param workoutPlaceSeq 장소 시퀀스 ID
 * @param userInfo 현재 로그인한 사용자 정보
 * @returns 팔로우 상태, 로딩 상태, 팔로워 수, 토글 함수, 업데이트 함수
 */
const usePlaceFollow = (workoutPlaceSeq: string | undefined, userInfo: any) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(0);

  // 팔로우 상태 확인
  useEffect(() => {
    if (!workoutPlaceSeq || !userInfo?.userSeq) return;

    const checkFollowStatus = async () => {
      setIsFollowingLoading(true);
      try {
        const isFollowing = await checkPlaceFollowStatusAPI(
          Number(workoutPlaceSeq)
        );
        setIsFollowing(isFollowing);
      } catch (error) {
        console.error("팔로우 상태 확인 중 오류 발생:", error);
      } finally {
        setIsFollowingLoading(false);
      }
    };

    checkFollowStatus();
  }, [workoutPlaceSeq, userInfo]);

  // 팔로워 수 불러오기
  useEffect(() => {
    if (!workoutPlaceSeq) return;

    const loadFollowerCount = async () => {
      try {
        const count = await getPlaceFollowerCountAPI(Number(workoutPlaceSeq));
        setFollowerCount(count);
      } catch (error) {
        console.error("팔로워 수 확인 중 오류 발생:", error);
      }
    };

    loadFollowerCount();
  }, [workoutPlaceSeq]);

  // 팔로워 수 업데이트
  const updateFollowerCount = useCallback(async () => {
    if (!workoutPlaceSeq) return;
    try {
      const count = await getPlaceFollowerCountAPI(Number(workoutPlaceSeq));
      setFollowerCount(count);
    } catch (error) {
      console.error("팔로워 수 업데이트 중 오류 발생:", error);
    }
  }, [workoutPlaceSeq]);

  // 팔로우/언팔로우 토글
  const toggleFollow = useCallback(async () => {
    if (!workoutPlaceSeq || !userInfo?.userSeq) return;

    setIsFollowingLoading(true);
    try {
      if (isFollowing) {
        await unfollowPlaceAPI(Number(workoutPlaceSeq));
        setIsFollowing(false);
      } else {
        await followPlaceAPI(Number(workoutPlaceSeq));
        setIsFollowing(true);
      }
      // 팔로워 수 즉시 업데이트
      await updateFollowerCount();
    } catch (error) {
      console.error("팔로우/언팔로우 중 오류 발생:", error);
    } finally {
      setIsFollowingLoading(false);
    }
  }, [workoutPlaceSeq, userInfo, isFollowing, updateFollowerCount]);

  return {
    isFollowing,
    isFollowingLoading,
    followerCount,
    toggleFollow,
    updateFollowerCount,
  };
};

export default usePlaceFollow;
