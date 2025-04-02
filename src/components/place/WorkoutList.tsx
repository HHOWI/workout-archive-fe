import React from "react";
import { WorkoutOfTheDayDTO } from "../../dtos/WorkoutDTO";
import WorkoutCard from "../WorkoutCard";
import {
  WorkoutGrid,
  NoDataMessage,
  LoaderContainer,
  SpinnerIcon,
} from "../../styles/CommonStyles";

interface WorkoutListProps {
  workouts: WorkoutOfTheDayDTO[];
  hasMore: boolean;
  loading: boolean;
  observerRef: React.RefObject<HTMLDivElement>;
  onWorkoutClick: (seq: number) => void;
}

/**
 * 운동 목록 컴포넌트
 */
const WorkoutList: React.FC<WorkoutListProps> = React.memo(
  ({ workouts, hasMore, loading, observerRef, onWorkoutClick }) => {
    if (workouts.length === 0) {
      return (
        <NoDataMessage>이 장소에 저장된 운동 기록이 없습니다.</NoDataMessage>
      );
    }

    return (
      <>
        <WorkoutGrid>
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.workoutOfTheDaySeq}
              workout={workout}
              onClick={() => onWorkoutClick(workout.workoutOfTheDaySeq)}
            />
          ))}
        </WorkoutGrid>
        {hasMore && (
          <LoaderContainer ref={observerRef}>
            {loading && (
              <>
                <SpinnerIcon />
                <span>더 불러오는 중...</span>
              </>
            )}
          </LoaderContainer>
        )}
      </>
    );
  }
);

export default WorkoutList;
