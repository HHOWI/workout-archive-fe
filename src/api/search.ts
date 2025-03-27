import { publicAPI } from "./axiosConfig";
import { UserSearchResultDTO, PlaceSearchResultDTO } from "../dtos/SearchDTO";

// 사용자 닉네임 검색 (@ 접두사) - 무한 스크롤 지원
export const searchUsersByNicknameAPI = async (
  keyword: string,
  cursor: number | null = null,
  limit: number = 10
): Promise<{
  users: UserSearchResultDTO[];
  nextCursor: number | null;
}> => {
  try {
    const params: any = {
      keyword,
      limit,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await publicAPI.get("/search/users", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("사용자 검색 중 오류 발생:", error);
    throw error;
  }
};

// 운동 장소 검색 (# 접두사) - 무한 스크롤 지원
export const searchWorkoutPlacesAPI = async (
  keyword: string,
  cursor: number | null = null,
  limit: number = 10
): Promise<{
  places: PlaceSearchResultDTO[];
  nextCursor: number | null;
}> => {
  try {
    const params: any = {
      keyword,
      limit,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await publicAPI.get("/search/places", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("장소 검색 중 오류 발생:", error);
    throw error;
  }
};
