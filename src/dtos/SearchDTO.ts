// 사용자 검색 결과 DTO
export interface UserSearchResultDTO {
  userSeq: number;
  userNickname: string;
  profileImageUrl: string | null;
}

// 운동 장소 검색 결과 DTO
export interface PlaceSearchResultDTO {
  workoutPlaceSeq: number;
  placeName: string;
  addressName: string | null;
  roadAddressName: string | null;
}
