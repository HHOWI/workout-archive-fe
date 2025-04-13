import { useState, useEffect, useCallback } from "react";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import {
  getUserWorkoutOfTheDaysByNicknameAPI,
  getUserWorkoutTotalCountByNicknameAPI,
  getWorkoutsByPlaceAPI,
} from "../api/workout";
import useInfiniteScroll from "./useInfiniteScroll";

type ContextType = "profile" | "place" | "other";

/**
 * 운동 데이터를 가져오는 커스텀 훅
 * @param context 컨텍스트 유형 (profile, place 등)
 * @param id 프로필 닉네임이나 장소 ID
 * @param activeTab 활성 탭 (선택적)
 * @returns 운동 데이터 관련 상태 및 상태 업데이트 함수
 */
const useWorkoutData = (
  context: ContextType,
  id: string | undefined,
  activeTab?: string
) => {
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // 총 운동 개수 조회
  useEffect(() => {
    if (!id || (context === "profile" && activeTab !== "workout")) return;

    const fetchTotalCount = async () => {
      try {
        if (context === "profile") {
          const response = await getUserWorkoutTotalCountByNicknameAPI(id);
          setTotalCount(response.count);
        } else if (context === "place") {
          // place 컨텍스트에 대한 총 운동 개수는 usePlaceData에서 가져오므로 필요 없음
        }
      } catch (err) {
        console.error("총 운동 기록 수 조회 중 오류:", err);
      }
    };

    fetchTotalCount();
  }, [id, context, activeTab]);

  // fetchData 함수 정의
  const fetchWorkoutsFunction = useCallback(
    async (cursor: string | null) => {
      if (!id) {
        return { data: [], nextCursor: null };
      }

      try {
        let response;
        if (context === "profile") {
          response = await getUserWorkoutOfTheDaysByNicknameAPI(id, 12, cursor);
        } else if (context === "place") {
          response = await getWorkoutsByPlaceAPI(id, 12, cursor);
        } else {
          return { data: [], nextCursor: null };
        }

        return {
          data: response.workouts || [],
          nextCursor: response.nextCursor,
        };
      } catch (error) {
        console.error("운동 기록 로드 실패:", error);
        setError(
          error instanceof Error
            ? error.message
            : "운동 기록을 불러오지 못했습니다"
        );
        throw error;
      }
    },
    [id, context]
  );

  // useInfiniteScroll 훅 사용
  const {
    data: workoutOfTheDays,
    loading,
    hasMore,
    observerTarget,
    resetData,
    cursor: nextCursor,
  } = useInfiniteScroll<WorkoutOfTheDayDTO, string>({
    fetchData: fetchWorkoutsFunction,
    isItemEqual: (a, b) => a.workoutOfTheDaySeq === b.workoutOfTheDaySeq,
  });

  // 탭 변경 시 데이터 초기화
  useEffect(() => {
    if (
      (context === "profile" && activeTab === "workout") ||
      context === "place"
    ) {
      resetData();
    }
  }, [context, activeTab, id, resetData]);

  return {
    workoutOfTheDays,
    totalWorkoutCount: totalCount,
    loading,
    hasMore,
    error,
    observerTarget,
    resetData,
  };
};

export default useWorkoutData;
