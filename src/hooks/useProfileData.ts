import { useState, useEffect, useCallback } from "react";
import { getProfileInfoAPI } from "../api/user";
import { getImageUrl } from "../utils/imageUtils";
import { FollowCountDTO } from "../dtos/FollowDTO";

/**
 * 프로필 데이터를 관리하는 커스텀 훅
 * @param nickname 사용자 닉네임
 * @param userInfo 현재 로그인한 사용자 정보
 * @returns 프로필 관련 상태 및 상태 업데이트 함수
 */
const useProfileData = (nickname: string | undefined, userInfo: any) => {
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userSeq, setUserSeq] = useState<number | null>(null);
  const [followCounts, setFollowCounts] = useState<FollowCountDTO | null>(null);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!nickname) return;
    setLoading(true);
    try {
      // 통합 API를 사용하여 프로필 데이터 가져오기
      const profileInfo = await getProfileInfoAPI(nickname);

      setProfileImageUrl(getImageUrl(profileInfo.imageUrl) || "");
      setTotalWorkoutCount(profileInfo.workoutCount);
      setIsOwnProfile(profileInfo.isOwner);
      setUserSeq(profileInfo.userSeq);
      setFollowCounts(profileInfo.followCounts);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [nickname]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    isOwnProfile,
    totalWorkoutCount,
    profileImageUrl,
    userSeq,
    followCounts,
    setProfileImageUrl,
    setTotalWorkoutCount,
    setFollowCounts,
    loading,
    initializeData,
  };
};

export default useProfileData;
