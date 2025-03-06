import React, { useState } from "react";
import styled from "@emotion/styled";
import { Exercise, RecordDetail } from "../types/WorkoutTypes";

const Container = styled.div`
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ExerciseName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const RemoveButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
`;

const SetContainer = styled.div`
  margin-top: 15px;
`;

const SetRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

const SetNumber = styled.div`
  width: 30px;
  font-weight: bold;
`;

const InputField = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 70px;
`;

const SetActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;

  &:hover {
    background: #357ac5;
  }
`;

interface ExerciseSetFormProps {
  exercise: Exercise;
  onRemove: () => void;
  onChange: (sets: RecordDetail[]) => void;
}

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = ({
  exercise,
  onRemove,
  onChange,
}) => {
  const [sets, setSets] = useState<RecordDetail[]>([{ weight: 0, reps: 0 }]);

  const handleAddSet = () => {
    const newSets = [...sets, { weight: 0, reps: 0 }];
    setSets(newSets);
    onChange(newSets);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = [...sets];
      newSets.splice(index, 1);
      setSets(newSets);
      onChange(newSets);
    }
  };

  const handleSetChange = (
    index: number,
    field: keyof RecordDetail,
    value: number
  ) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
    onChange(newSets);
  };

  return (
    <Container>
      <ExerciseHeader>
        <ExerciseName>{exercise.exerciseName}</ExerciseName>
        <RemoveButton onClick={onRemove}>삭제</RemoveButton>
      </ExerciseHeader>

      <SetContainer>
        {sets.map((set, index) => (
          <SetRow key={index}>
            <SetNumber>{index + 1}</SetNumber>
            <div>
              <label>무게(kg): </label>
              <InputField
                type="number"
                value={set.weight || ""}
                onChange={(e) =>
                  handleSetChange(index, "weight", Number(e.target.value))
                }
              />
            </div>
            <div>
              <label>횟수: </label>
              <InputField
                type="number"
                value={set.reps || ""}
                onChange={(e) =>
                  handleSetChange(index, "reps", Number(e.target.value))
                }
              />
            </div>
            <button onClick={() => handleRemoveSet(index)}>-</button>
          </SetRow>
        ))}
      </SetContainer>

      <SetActionButtons>
        <ActionButton onClick={handleAddSet}>세트 추가</ActionButton>
      </SetActionButtons>
    </Container>
  );
};

export default ExerciseSetForm;
