import React from "react";
import styled from "@emotion/styled";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getImageUrl } from "../utils/imageUtils";

// 스타일 컴포넌트
const Card = styled.div`
  aspect-ratio: 1/1;
  background-color: #000000;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const WorkoutImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.url || ""});
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
`;

const WorkoutCardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 10px;
  color: white;
  width: 100%;
`;

const WorkoutCardDate = styled.div`
  font-size: 0.75rem;
  margin-bottom: 3px;
  color: white;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.8), 0px 0px 2px rgba(0, 0, 0, 1);
`;

const WorkoutCardLocation = styled.div`
  font-size: 0.75rem;
  margin-bottom: 3px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.8), 0px 0px 2px rgba(0, 0, 0, 1);
`;

const WorkoutCardTitle = styled.div`
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WorkoutCardExerciseType = styled.div`
  font-size: 1rem;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 3px;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 1);
`;

interface WorkoutCardProps {
  workout: WorkoutOfTheDayDTO;
  onClick: (workoutOfTheDaySeq: number) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick }) => {
  return (
    <Card
      key={workout.workoutOfTheDaySeq}
      onClick={() => onClick(workout.workoutOfTheDaySeq)}
    >
      <WorkoutImage url={getImageUrl(workout.workoutPhoto || null)}>
        {!workout.workoutPhoto && (
          <span style={{ color: "#555", fontSize: "14px" }}>No Image</span>
        )}
      </WorkoutImage>
      <WorkoutCardOverlay>
        <WorkoutCardDate>
          {format(new Date(workout.recordDate), "yyyy년 MM월 dd일", {
            locale: ko,
          })}
        </WorkoutCardDate>
        {workout.workoutPlace?.placeName && (
          <WorkoutCardLocation>
            {workout.workoutPlace?.placeName}
          </WorkoutCardLocation>
        )}
        <WorkoutCardTitle>
          {workout.mainExerciseType && (
            <WorkoutCardExerciseType>
              {workout.mainExerciseType}
            </WorkoutCardExerciseType>
          )}
        </WorkoutCardTitle>
      </WorkoutCardOverlay>
    </Card>
  );
};

export default WorkoutCard;
