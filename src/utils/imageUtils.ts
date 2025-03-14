/**
 * 이미지 URL을 생성하는 유틸리티 함수
 * @param imagePath 서버에서 반환된 이미지 경로
 * @returns 완전한 이미지 URL 또는 undefined
 */
export const getImageUrl = (imagePath: string | null): string | undefined => {
  if (!imagePath) return undefined;

  // 이미 전체 URL인 경우
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // uploads/ 로 시작하는 경우
  if (imagePath.startsWith("uploads/")) {
    return `${process.env.REACT_APP_API_URL}/${imagePath}`;
  }

  // 그 외 경우
  return `${process.env.REACT_APP_API_URL}/uploads/${imagePath}`;
};
