import React, { useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  RecentWorkoutsButton,
  AddExerciseButton,
  DraggableExercise,
  Message,
} from "../../styles/WorkoutRecordStyles";
import { ExerciseRecordDTO, RecordDetailDTO } from "../../dtos/WorkoutDTO";
import ExerciseSetForm from "../ExerciseSetForm";

// 메모이제이션된 컴포넌트를 파일 스코프로 이동
const MemoizedExerciseSetForm = React.memo(ExerciseSetForm);

// SVG 컴포넌트 분리
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface ExerciseListSectionProps {
  exerciseRecords: ExerciseRecordDTO[];
  onRemoveExercise: (index: number) => void;
  onSetsChange: (index: number, sets: RecordDetailDTO[]) => void;
  onAddExercise: () => void;
  onLoadRecentWorkouts: () => void;
  isLoadingDetails: boolean;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
}

const ExerciseListSection: React.FC<ExerciseListSectionProps> = ({
  exerciseRecords,
  onRemoveExercise,
  onSetsChange,
  onAddExercise,
  onLoadRecentWorkouts,
  isLoadingDetails,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>운동 목록</CardTitle>
        <RecentWorkoutsButton onClick={onLoadRecentWorkouts}>
          <CalendarIcon />
          최근 운동 목록 가져오기
        </RecentWorkoutsButton>
      </CardHeader>

      <CardBody>
        {isLoadingDetails && <Message>운동 상세 정보를 불러오는 중...</Message>}

        {exerciseRecords.map((record, index) => (
          <DraggableExercise
            key={record.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            isDragging={index === draggedIndex}
          >
            <MemoizedExerciseSetForm
              exercise={record.exercise}
              onRemove={() => onRemoveExercise(index)}
              onChange={(sets) => onSetsChange(index, sets)}
              setCount={record.setCount}
              initialSets={record.sets}
            />
          </DraggableExercise>
        ))}

        {exerciseRecords.length === 0 && (
          <Message>아직 추가된 운동이 없습니다. 운동을 추가해보세요.</Message>
        )}

        <AddExerciseButton onClick={onAddExercise}>
          + 운동 추가하기
        </AddExerciseButton>
      </CardBody>
    </Card>
  );
};

export default ExerciseListSection;
