import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaDumbbell, FaFire, FaTrophy, FaCheck } from "react-icons/fa";
import { getUserMonthlyWorkoutDataAPI } from "../../api/workout";
import { fadeIn, theme } from "../../styles/theme";
import { NoDataMessage, SpinnerIcon } from "../../styles/CommonStyles";
import { ko } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import WorkoutDetailModal from "../WorkoutDetailModal";

// 타입 정의
interface WorkoutData {
  date: Date;
  workoutSeq: number;
}

interface WorkoutStats {
  totalWorkouts: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  daysInMonth: number;
}

interface CalendarViewProps {
  nickname: string | undefined;
}

// 스타일 컴포넌트
const CalendarContainer = styled.div`
  margin: 20px auto;
  max-width: 800px;
  font-family: "Noto Sans KR", sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
`;

const ContentBox = styled.div`
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
  padding: 20px;
  margin-bottom: 16px;
  width: 100%;
`;

const StatsContainer = styled(ContentBox)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 25px 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const StatItem = styled.div`
  flex: 1;
  min-width: 100px;
  text-align: center;
  position: relative;
  padding: 0 10px;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background-color: rgba(74, 144, 226, 0.15);
  }

  .stat-icon {
    font-size: 1.2rem;
    margin-bottom: 6px;
    color: ${theme.primary};
  }

  .stat-title {
    font-size: 0.85rem;
    color: ${theme.textMuted};
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${theme.primary};
    margin: 5px 0;
  }

  .stat-desc {
    font-size: 0.8rem;
    color: ${theme.textMuted};
  }

  @media (max-width: 576px) {
    flex: 0 0 50%;
    margin-bottom: 15px;

    &:nth-child(even)::after {
      display: none;
    }

    &:nth-child(1)::before,
    &:nth-child(2)::before {
      content: "";
      position: absolute;
      bottom: -7px;
      left: 15%;
      width: 70%;
      height: 1px;
      background-color: rgba(74, 144, 226, 0.15);
    }
  }
`;

const CalendarDatePickerWrapper = styled(ContentBox)`
  .react-datepicker {
    width: 100%;
    border: none;
    font-family: "Noto Sans KR", sans-serif;
    background-color: transparent;
    padding: 0;
  }

  .react-datepicker__month-container {
    width: 100%;
    float: none;
  }

  .react-datepicker__month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin: 0;
    padding: 0;
  }

  .react-datepicker__week {
    display: contents;
  }

  .react-datepicker__header {
    background-color: transparent;
    border-bottom: none;
    padding: 0 0 15px;
  }

  .react-datepicker__day-names {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .react-datepicker__day-name {
    width: auto;
    margin: 0;
    font-weight: 500;
    color: ${theme.textLight};
    font-size: 0.85rem;
    text-align: center;
    padding: 5px 0;
  }

  .react-datepicker__day {
    width: auto;
    height: auto;
    margin: 0;
    padding: 10px 0;
    line-height: 25px;
    border-radius: 10px;
    color: ${theme.text};
    transition: all 0.25s ease;
    cursor: pointer;
    position: relative;
    font-size: 0.95rem;
    box-shadow: none;
  }

  .react-datepicker__day--today {
    font-weight: normal;
    color: ${theme.text};
    background-color: transparent;
    border: none;
  }

  .react-datepicker__day--selected {
    background-color: transparent !important;
    color: inherit !important;
    font-weight: normal !important;
  }

  .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(
      .workout-day
    ) {
    background-color: ${theme.secondary};
    transform: none;
    box-shadow: none;
  }

  .react-datepicker__day--outside-month {
    color: ${theme.textMuted};
    cursor: default;
    pointer-events: none;
    background-color: transparent !important;
    box-shadow: none;
    opacity: 0.5;
  }

  .react-datepicker__current-month {
    display: none;
  }

  .react-datepicker__navigation {
    top: 25px;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    transition: all 0.2s;

    &:hover {
      background-color: ${theme.secondary};
      transform: scale(1.1);
    }
  }

  .react-datepicker__navigation--previous {
    left: 25px;
  }

  .react-datepicker__navigation--next {
    right: 25px;
  }

  .workout-day {
    background: linear-gradient(
      135deg,
      rgba(74, 144, 226, 0.12),
      rgba(74, 144, 226, 0.18)
    );
    font-weight: 600;
    color: ${theme.primaryDark};
    border: none;
    box-shadow: none;

    &:hover:not(.react-datepicker__day--disabled) {
      background: linear-gradient(
        135deg,
        rgba(74, 144, 226, 0.18),
        rgba(74, 144, 226, 0.25)
      );
      transform: none;
      box-shadow: none;
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 16px;
    backdrop-filter: blur(3px);
  }
`;

const WorkoutLegend = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  margin-top: 22px;
  color: ${theme.textMuted};
  justify-content: flex-end;
  padding-right: 8px;

  .highlight-box {
    width: 14px;
    height: 14px;
    background: linear-gradient(
      135deg,
      rgba(74, 144, 226, 0.12),
      rgba(74, 144, 226, 0.18)
    );
    border: 1px solid rgba(74, 144, 226, 0.25);
    border-radius: 4px;
    display: inline-block;
    margin-right: 10px;
    box-shadow: 0 2px 4px rgba(74, 144, 226, 0.1);
  }
`;

// 통계 패널 컴포넌트
const StatsPanel = ({ stats }: { stats: WorkoutStats }) => {
  if (!stats) return null;

  return (
    <StatsContainer>
      <StatItem>
        <div className="stat-icon">
          <FaDumbbell />
        </div>
        <div className="stat-title">총 {stats.daysInMonth}일 중</div>
        <div className="stat-value">{stats.totalWorkouts}회</div>
        <div className="stat-desc">운동</div>
      </StatItem>

      <StatItem>
        <div className="stat-icon">
          <FaCheck />
        </div>
        <div className="stat-title">월간 운동률</div>
        <div className="stat-value">{Math.round(stats.completionRate)}%</div>
      </StatItem>

      <StatItem>
        <div className="stat-icon">
          <FaFire />
        </div>
        <div className="stat-title">현재 연속</div>
        <div className="stat-value">{stats.currentStreak}일</div>
        <div className="stat-desc">운동 중</div>
      </StatItem>

      <StatItem>
        <div className="stat-icon">
          <FaTrophy />
        </div>
        <div className="stat-title">최장 연속</div>
        <div className="stat-value">{stats.longestStreak}일</div>
        <div className="stat-desc">운동 기록</div>
      </StatItem>
    </StatsContainer>
  );
};

// 달력 헤더 컴포넌트
const CalendarHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled?: boolean;
  nextMonthButtonDisabled?: boolean;
}) => (
  <div
    style={{
      margin: "10px 0 20px 0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    }}
  >
    <button
      onClick={decreaseMonth}
      disabled={prevMonthButtonDisabled}
      type="button"
      className="react-datepicker__navigation react-datepicker__navigation--previous"
      aria-label="이전 달"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">
        {"<"}
      </span>
    </button>
    <span
      style={{
        fontSize: "1.25rem",
        fontWeight: "600",
        color: theme.textDark,
        padding: "8px 16px",
        borderRadius: "8px",
        background: "rgba(74, 144, 226, 0.05)",
      }}
    >
      {format(date, "yyyy년 MM월")}
    </span>
    <button
      onClick={increaseMonth}
      disabled={nextMonthButtonDisabled}
      type="button"
      className="react-datepicker__navigation react-datepicker__navigation--next"
      aria-label="다음 달"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">
        {">"}
      </span>
    </button>
  </div>
);

// 메인 컴포넌트
const CalendarView = React.memo(({ nickname }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyWorkoutData, setMonthlyWorkoutData] = useState<WorkoutData[]>(
    []
  );
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkoutSeq, setSelectedWorkoutSeq] = useState<number | null>(
    null
  );

  // 데이터 로드
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!nickname) return;

      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      setLoading(true);
      try {
        const response = await getUserMonthlyWorkoutDataAPI(
          nickname,
          year,
          month
        );
        setMonthlyWorkoutData(response.workoutData);
        setStats(response.stats);
      } catch (err) {
        console.error("운동 날짜 데이터 로드 실패:", err);
        setError("운동 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [selectedDate, nickname]);

  // 이벤트 핸들러
  const handleDateClick = (date: Date | null) => {
    if (!date) return;

    const workout = monthlyWorkoutData.find((wd) => isSameDay(wd.date, date));
    if (workout) {
      setSelectedWorkoutSeq(workout.workoutSeq);
    } else {
      setSelectedDate(date);
    }
  };

  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedWorkoutSeq(null);
  };

  const handleCloseModal = () => {
    setSelectedWorkoutSeq(null);
  };

  // 헬퍼 함수
  const isWorkoutDay = (date: Date): boolean => {
    return monthlyWorkoutData.some((wd) => isSameDay(wd.date, date));
  };

  const getDayClassNames = (date: Date): string => {
    return isWorkoutDay(date) ? "workout-day" : "";
  };

  if (error) {
    return <NoDataMessage>{error}</NoDataMessage>;
  }

  return (
    <CalendarContainer>
      {loading && (
        <div className="loading-overlay">
          <SpinnerIcon />
        </div>
      )}

      {stats && <StatsPanel stats={stats} />}

      <CalendarDatePickerWrapper>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateClick}
          onMonthChange={handleMonthChange}
          locale={ko}
          inline
          dayClassName={getDayClassNames}
          renderCustomHeader={CalendarHeader}
        />

        <WorkoutLegend>
          <span className="highlight-box"></span> 운동 기록
        </WorkoutLegend>
      </CalendarDatePickerWrapper>

      {selectedWorkoutSeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutSeq}
          onClose={handleCloseModal}
        />
      )}
    </CalendarContainer>
  );
});

export default CalendarView;
