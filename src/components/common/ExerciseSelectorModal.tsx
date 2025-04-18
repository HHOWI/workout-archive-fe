import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
} from "../../styles/WorkoutRecordStyles";
import ExerciseSelector from "./ExerciseSelector";
import { ExerciseDTO, RecordDetailDTO } from "../../dtos/WorkoutDTO";

// 타입 분리로 재사용성 향상
export interface ExerciseWithSets {
  exercise: ExerciseDTO;
  sets: RecordDetailDTO[];
  setCount?: number;
}

interface ExerciseSelectorModalProps {
  onSelectExercises: (exercisesWithSets: ExerciseWithSets[]) => void;
  onClose: () => void;
}

const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  onSelectExercises,
  onClose,
}) => {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>운동 선택</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <ExerciseSelector
            onSelectExercises={onSelectExercises}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExerciseSelectorModal;
