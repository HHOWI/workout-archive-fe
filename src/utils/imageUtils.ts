export const getImageUrl = (
  imagePath: string | null,
  type: "profile" | "workout" = "profile"
): string => {
  // null이나 빈 문자열인 경우 타입에 따라 다르게 처리
  if (!imagePath) {
    // 프로필 이미지인 경우 기본 이미지 반환
    if (type === "profile") {
      const defaultImage = process.env.REACT_APP_DEFAULT_PROFILE_IMAGE || "";
      // 기본 이미지 경로가 있고 uploads/로 시작하는 경우 API URL과 조합
      if (defaultImage && defaultImage.startsWith("uploads/")) {
        return `${process.env.REACT_APP_API_URL}/${defaultImage}`;
      }
      return defaultImage;
    }
    // 워크아웃 이미지인 경우 빈 문자열 반환
    return "";
  }

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
