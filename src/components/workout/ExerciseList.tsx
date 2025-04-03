import React, { useState } from "react";
import styled from "@emotion/styled";
import { Paper, Typography, IconButton, Collapse } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  DirectionsRun,
  FitnessCenterOutlined,
} from "@mui/icons-material";

// 타입 정의
interface ExerciseSet {
  weight?: number;
  reps?: number;
  distance?: number;
  recordTime?: number;
}

interface Exercise {
  exercise: string;
  type: string;
  sets: ExerciseSet[];
}

interface ExerciseItemProps {
  exercise: string;
  type: string;
  sets: ExerciseSet[];
}

interface ExerciseListProps {
  exercises: Exercise[];
}

// 스타일 컴포넌트
const ExerciseContainer = styled(Paper)`
  padding: 18px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const ExerciseTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ExerciseTypeChip = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: #e8f2ff;
  color: #4a90e2;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.15);
`;

const ExerciseSets = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const SetItem = styled.div`
  background-color: #f9f9f9;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  border: 1px solid #eee;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #f0f0f0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
`;

const Divider = styled.span`
  margin: 0 4px;
  color: #bbb;
`;

// 유틸리티 함수
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return secs === 0
      ? `${hours}시간 ${mins}분`
      : `${hours}시간 ${mins}분 ${secs < 10 ? "0" + secs : secs}초`;
  } else if (mins > 0) {
    return secs === 0
      ? `${mins}분`
      : `${mins}분 ${secs < 10 ? "0" + secs : secs}초`;
  } else {
    return `${secs}초`;
  }
};

const formatDistance = (distance: number): string => {
  return distance >= 1000
    ? `${(distance / 1000).toFixed(1)}km`
    : `${distance}m`;
};

// 컴포넌트
const CardioSetItem: React.FC<{ set: ExerciseSet }> = ({ set }) => {
  const hasDistance = set.distance != null && set.distance > 0;
  const hasTime = set.recordTime != null && set.recordTime > 0;

  if (!hasDistance && !hasTime) return null;

  return (
    <SetItem>
      {hasDistance && hasTime ? (
        <>
          <span>{formatDistance(set.distance!)}</span>
          <Divider>•</Divider>
          <span>{formatTime(set.recordTime!)}</span>
        </>
      ) : hasDistance ? (
        <span>{formatDistance(set.distance!)}</span>
      ) : (
        <span>{formatTime(set.recordTime!)}</span>
      )}
    </SetItem>
  );
};

const WeightSetItem: React.FC<{ set: ExerciseSet }> = ({ set }) => {
  if (!set.weight || !set.reps) return null;

  return (
    <SetItem>
      <span>
        {set.weight}kg × {set.reps}회
      </span>
    </SetItem>
  );
};

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  type,
  sets,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCardio = type === "유산소";

  return (
    <ExerciseContainer elevation={0}>
      <ExerciseHeader onClick={() => setExpanded(!expanded)}>
        <ExerciseTitle>
          {isCardio ? (
            <DirectionsRun fontSize="small" color="primary" />
          ) : (
            <FitnessCenterOutlined fontSize="small" color="primary" />
          )}
          {exercise}
          <ExerciseTypeChip>{type}</ExerciseTypeChip>
        </ExerciseTitle>
        <IconButton size="small">
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </ExerciseHeader>

      <Collapse in={expanded}>
        <ExerciseSets>
          {sets.map((set, index) =>
            isCardio ? (
              <CardioSetItem key={index} set={set} />
            ) : (
              <WeightSetItem key={index} set={set} />
            )
          )}
        </ExerciseSets>
      </Collapse>
    </ExerciseContainer>
  );
};

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  if (!exercises || exercises.length === 0) return null;

  return (
    <div>
      {exercises.map((exercise, index) => (
        <ExerciseItem
          key={index}
          exercise={exercise.exercise}
          type={exercise.type}
          sets={exercise.sets}
        />
      ))}
    </div>
  );
};

export default ExerciseList;
