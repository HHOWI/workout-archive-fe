import { useCallback, useEffect } from "react";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { getWorkoutsByPlaceAPI } from "../api/workout";
import useInfiniteScroll from "./useInfiniteScroll";

/**
 * 장소별 운동 기록을 가져오는 커스텀 훅
 * @param placeSeq 장소 시퀀스 ID
 * @returns 운동 데이터, 로딩 상태, 추가 데이터 유무, 인피니티 스크롤을 위한 ref
 */
const usePlaceWorkoutData = (placeSeq: string | undefined) => {
  // fetchData 함수 정의
  const fetchWorkoutsFunction = useCallback(
    async (cursor: string | null) => {
      if (!placeSeq) {
        return { data: [], nextCursor: null };
      }

      try {
        console.log("장소 운동 기록 가져오기:", { placeSeq, cursor });
        const response = await getWorkoutsByPlaceAPI(placeSeq, 12, cursor);
        console.log("장소 운동 기록 응답:", {
          data: response.workouts.length,
          nextCursor: response.nextCursor,
        });
        return {
          data: response.workouts || [],
          nextCursor: response.nextCursor,
        };
      } catch (error) {
        console.error("운동 기록 로드 실패:", error);
        throw error;
      }
    },
    [placeSeq]
  );

  // useInfiniteScroll 훅 사용
  const {
    data: workoutOfTheDays,
    loading,
    hasMore,
    observerTarget,
    resetData,
  } = useInfiniteScroll<WorkoutOfTheDayDTO, string>({
    fetchData: fetchWorkoutsFunction,
    isItemEqual: (a, b) => a.workoutOfTheDaySeq === b.workoutOfTheDaySeq,
  });

  // placeSeq가 변경될 때마다 데이터 초기화
  useEffect(() => {
    console.log("placeSeq 변경됨, 데이터 초기화:", placeSeq);
    resetData();
  }, [placeSeq, resetData]);

  return { workoutOfTheDays, loading, hasMore, observerTarget, resetData };
};

export default usePlaceWorkoutData;
