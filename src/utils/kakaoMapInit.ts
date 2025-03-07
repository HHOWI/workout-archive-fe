// kakaoMapInit.ts
declare global {
  interface Window {
    kakao: any;
  }
}

let isInitialized = false;

// 카카오맵 API 스크립트 로드 및 초기화 함수
export const initKakaoMap = (): Promise<void> => {
  if (isInitialized) {
    return Promise.resolve();
  }

  const apiKey = process.env.REACT_APP_KAKAO_MAP_API_KEY;

  // 디버깅을 위한 로그 (실제 배포 시 제거 필요)
  console.log("API Key 존재 여부:", !!apiKey);

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "카카오맵 API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_KAKAO_MAP_API_KEY를 설정해주세요."
      )
    );
  }

  return new Promise((resolve, reject) => {
    // 이미 로드된 스크립트 확인
    const existingScript = document.getElementById("kakao-map-script");
    if (existingScript) {
      if (window.kakao && window.kakao.maps) {
        isInitialized = true;
        resolve();
        return;
      }
    }

    // 새 스크립트 생성
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer,drawing`;
    script.async = true;
    script.onload = () => {
      try {
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error("카카오맵 객체를 찾을 수 없습니다."));
          return;
        }
        window.kakao.maps.load(() => {
          isInitialized = true;
          resolve();
        });
      } catch (err: any) {
        reject(new Error(`카카오맵 초기화 중 오류: ${err.message}`));
      }
    };
    script.onerror = (e) => {
      console.error("카카오맵 스크립트 로드 실패:", e);
      reject(new Error("카카오맵 API 로드 실패"));
    };

    document.head.appendChild(script);
  });
};

export default initKakaoMap;
