import { useState, useCallback, useEffect } from "react";
import { WorkoutPlaceDTO } from "../dtos/WorkoutDTO";
import {
  getWorkoutsByPlaceAPI,
  getWorkoutOfTheDayCountByPlaceIdAPI,
} from "../api/workout";

/**
 * 장소 정보와 관련 데이터를 가져오는 커스텀 훅
 * @param placeSeq 장소 시퀀스 ID
 * @returns 장소 정보, 운동 총 횟수, 로딩 상태
 */
const usePlaceData = (placeSeq: string | undefined) => {
  const [placeInfo, setPlaceInfo] = useState<WorkoutPlaceDTO>({
    workoutPlaceSeq: 0,
    placeName: "",
    addressName: "",
    roadAddressName: "",
    x: "",
    y: "",
    kakaoPlaceId: "",
  });
  const [totalWorkoutCount, setTotalWorkoutCount] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // 초기 데이터 로드 및 상태 초기화
  const initializeData = useCallback(async () => {
    if (!placeSeq) return;

    setInitialLoading(true);

    try {
      const response = await getWorkoutsByPlaceAPI(placeSeq, 12, null);

      if (response.placeInfo) {
        setPlaceInfo(response.placeInfo);
      }

      const countResponse = await getWorkoutOfTheDayCountByPlaceIdAPI(placeSeq);
      setTotalWorkoutCount(countResponse.count);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [placeSeq]);

  // placeSeq가 변경될 때마다 데이터 다시 로드
  useEffect(() => {
    initializeData();
  }, [placeSeq, initializeData]);

  return { placeInfo, totalWorkoutCount, initialLoading };
};

export default usePlaceData;
