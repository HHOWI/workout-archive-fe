import { useCallback } from "react";
import {
  followUserAPI,
  unfollowUserAPI,
  checkUserFollowStatusAPI,
} from "../api/follow";
import { getProfileInfoAPI } from "../api/user";
import { useState, useEffect } from "react";
import { FollowCountDTO } from "../dtos/FollowDTO";

/**
 * 사용자 팔로우 관련 기능을 제공하는 커스텀 훅
 * @param targetUserSeq 대상 사용자 시퀀스
 * @param currentUserInfo 현재 로그인한 사용자 정보
 * @param nickname 사용자 닉네임 (프로필 정보 갱신에 사용)
 * @param initialFollowCounts 초기 팔로우 카운트
 * @param initialIsFollowing 초기 팔로우 상태
 * @returns 팔로우 상태, 로딩 상태, 팔로워 수, 토글 함수
 */
const useFollowActions = (
  targetUserSeq: number | null,
  currentUserInfo: any,
  nickname?: string,
  initialFollowCounts: FollowCountDTO | null = null,
  initialIsFollowing?: boolean
) => {
  const [followCounts, setFollowCounts] = useState<FollowCountDTO | null>(
    initialFollowCounts
  );
  const [isFollowing, setIsFollowing] = useState<boolean>(
    initialIsFollowing || false
  );
  const [isFollowingLoading, setIsFollowingLoading] = useState<boolean>(false);

  // 초기 팔로우 카운트 설정
  useEffect(() => {
    if (initialFollowCounts) {
      setFollowCounts(initialFollowCounts);
    }
  }, [initialFollowCounts]);

  // 초기 팔로우 상태 설정
  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing]);

  // 팔로우 상태 및 카운트 조회
  useEffect(() => {
    if (!targetUserSeq || !nickname) return;

    // 팔로우 카운트가 없을 때 조회
    if (!followCounts) {
      const fetchFollowCounts = async () => {
        try {
          const profileInfo = await getProfileInfoAPI(nickname);
          setFollowCounts(profileInfo.followCounts);
        } catch (error) {
          console.error("팔로우 카운트 조회 중 오류 발생:", error);
        }
      };
      fetchFollowCounts();
    }

    // 초기 팔로우 상태가 제공되지 않은 경우에만 API 호출
    if (initialIsFollowing === undefined) {
      // 로그인한 사용자가 이 프로필 사용자를 팔로우하는지 확인
      const checkFollowStatus = async () => {
        if (
          !currentUserInfo?.userSeq ||
          currentUserInfo.userSeq === targetUserSeq
        ) {
          setIsFollowing(false);
          return;
        }

        setIsFollowingLoading(true);
        try {
          const isFollowing = await checkUserFollowStatusAPI(targetUserSeq);
          setIsFollowing(isFollowing);
        } catch (error) {
          console.error("팔로우 상태 확인 중 오류 발생:", error);
        } finally {
          setIsFollowingLoading(false);
        }
      };

      checkFollowStatus();
    }
  }, [
    targetUserSeq,
    currentUserInfo,
    followCounts,
    nickname,
    initialIsFollowing,
  ]);

  // 팔로우 카운트 업데이트 함수
  const updateFollowCounts = useCallback(async () => {
    if (!targetUserSeq || !nickname) return;

    try {
      const profileInfo = await getProfileInfoAPI(nickname);
      setFollowCounts(profileInfo.followCounts);
    } catch (error) {
      console.error("팔로우 카운트 업데이트 중 오류 발생:", error);
    }
  }, [targetUserSeq, nickname]);

  // 팔로우/언팔로우 토글 함수
  const toggleFollow = useCallback(async () => {
    if (!currentUserInfo?.userSeq || !targetUserSeq) return;

    try {
      if (isFollowing) {
        await unfollowUserAPI(targetUserSeq);
        setIsFollowing(false);
      } else {
        await followUserAPI(targetUserSeq);
        setIsFollowing(true);
      }

      // 팔로우 카운트 업데이트
      await updateFollowCounts();
    } catch (error) {
      console.error("팔로우/언팔로우 중 오류 발생:", error);
    }
  }, [currentUserInfo, targetUserSeq, isFollowing, updateFollowCounts]);

  return {
    followCounts,
    isFollowing,
    isFollowingLoading,
    setFollowCounts,
    setIsFollowing,
    updateFollowCounts,
    toggleFollow,
  };
};

export default useFollowActions;
