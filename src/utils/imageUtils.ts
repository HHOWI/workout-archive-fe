interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
}

export const getImageUrl = (
  imagePath: string | null,
  type: "profile" | "workout" = "profile",
  options?: ImageOptions
): string => {
  let baseUrl = "";

  // null이나 빈 문자열인 경우 타입에 따라 다르게 처리
  if (!imagePath) {
    // 프로필 이미지인 경우 기본 이미지 반환
    if (type === "profile") {
      const defaultImage = process.env.REACT_APP_DEFAULT_PROFILE_IMAGE || "";
      // 기본 이미지 경로가 있고 uploads/로 시작하는 경우 API URL과 조합
      if (defaultImage && defaultImage.startsWith("uploads/")) {
        baseUrl = `${process.env.REACT_APP_API_URL}/${defaultImage}`;
      } else {
        baseUrl = defaultImage;
      }
    } else {
      // 워크아웃 이미지인 경우 빈 문자열 반환
      baseUrl = "";
    }
  } else if (imagePath.startsWith("http")) {
    // 이미 전체 URL인 경우
    baseUrl = imagePath;
  } else if (imagePath.startsWith("uploads/")) {
    // uploads/ 로 시작하는 경우
    baseUrl = `${process.env.REACT_APP_API_URL}/${imagePath}`;
  } else {
    // 그 외 경우 (타입에 따라 경로 조정)
    const prefix = type === "workout" ? "uploads/posts" : "uploads/profiles";
    baseUrl = `${process.env.REACT_APP_API_URL}/${prefix}/${imagePath}`;
  }

  // 옵션이 있고, 기본 URL이 있는 경우 쿼리 파라미터 추가
  if (options && baseUrl) {
    const params = [];
    if (options.width) params.push(`width=${options.width}`);
    if (options.height) params.push(`height=${options.height}`);
    if (options.quality) params.push(`quality=${options.quality}`);
    if (options.format) params.push(`format=${options.format}`);

    if (params.length > 0) {
      // URL에 이미 쿼리 파라미터가 있는지 확인
      baseUrl += (baseUrl.includes("?") ? "&" : "?") + params.join("&");
    }
  }

  return baseUrl;
};
