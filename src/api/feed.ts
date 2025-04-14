import { authAPI } from "./axiosConfig";
import { FeedResponseDTO } from "../dtos/FeedDTO";

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
