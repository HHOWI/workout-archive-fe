import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 문자열을 상대 시간 또는 지정된 형식으로 포맷합니다.
 * 24시간 이내의 날짜는 상대 시간(예: "5시간 전")으로, 그 외에는 'yyyy.MM.dd HH:mm' 형식으로 표시합니다.
 * @param dateString ISO 8601 형식의 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
export const formatDisplayDate = (dateString?: string): string => {
  if (!dateString) {
    return "";
  }
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ko });
    }
    return format(date, "yyyy.MM.dd HH:mm", { locale: ko });
  } catch (error) {
    return "유효하지 않은 날짜";
  }
};

/**
 * Date 객체를 로컬 시간대 기준으로 'YYYY-MM-DD' 형식 문자열로 변환합니다.
 * @param date 변환할 Date 객체
 * @returns 'YYYY-MM-DD' 형식 문자열
 */
export const formatDateToYYYYMMDDLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth()는 0부터 시작
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
