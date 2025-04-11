import { authAPI } from "./axiosConfig";

export interface FeedItemDTO {
  workoutOfTheDaySeq: number;
  recordDate: string;
  workoutPhoto?: string | null;
  workoutDiary?: string | null;
  workoutLikeCount: number;
  commentCount: number;
  workoutPlace?: {
    workoutPlaceSeq: number;
    placeName: string;
  } | null;
  user: {
    userSeq: number;
    userNickname: string;
    profileImageUrl: string | null;
  };
  mainExerciseType?: string | null;
  isLiked: boolean;
  source: "user" | "place";
}

export interface FeedResponseDTO {
  feeds: FeedItemDTO[];
  nextCursor: number | null;
}

// 피드 가져오기 API
export const getFeedAPI = async (
  limit: number = 12,
  cursor: number | null = null
): Promise<FeedResponseDTO> => {
  const params: any = { limit };
  if (cursor !== null) {
    params.cursor = cursor;
  }

  const response = await authAPI.get("/feed", { params });
  return response.data;
};
