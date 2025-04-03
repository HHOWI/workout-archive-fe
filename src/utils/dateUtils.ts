import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 문자열을 포맷팅합니다.
 * @param dateString 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "날짜 정보 없음";
    }
    return format(date, "yyyy년 MM월 dd일 EEEE", { locale: ko });
  } catch (error) {
    return "날짜 정보 없음";
  }
};

/**
 * 초 단위 시간을 분:초 형식으로 포맷팅합니다.
 * @param seconds 초 단위 시간
 * @returns 포맷팅된 시간 문자열 (예: "3:45")
 */
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

/**
 * 날짜가 유효한지 확인합니다.
 * @param date 확인할 날짜
 * @returns 유효한 날짜인지 여부
 */
export const isValidDate = (date: any) => {
  return date && !isNaN(new Date(date).getTime());
};

/**
 * 한국어 로케일로 날짜를 포맷팅합니다.
 * @param date 포맷팅할 날짜
 * @param formatStr 포맷 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export const formatKoreanDate = (date: Date, formatStr: string) => {
  return format(date, formatStr, { locale: ko });
};
