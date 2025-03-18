import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { ExerciseDTO, RecordDetailDTO } from "../dtos/WorkoutDTO";

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

const ExerciseInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExerciseName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const ExerciseType = styled.span`
  font-size: 14px;
  color: #666;
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
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }
`;

const SetCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
  min-width: 100px;
  max-width: 100px;
  background-color: #f9f9f9;
  flex-shrink: 0;
`;

const SetNumber = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 6px;
  text-align: center;
  padding: 2px;
  background-color: #eee;
  border-radius: 4px;
`;

const InputField = styled.input<{ isRequired?: boolean }>`
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-top: 3px;
  font-size: 13px;
  box-sizing: border-box;
  background-color: ${({ isRequired }) => (isRequired ? "#fff5f5" : "white")};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const InputLabel = styled.label`
  font-size: 11px;
  margin-bottom: 2px;
  color: #555;
`;

const RequiredText = styled.span`
  color: red;
  font-size: 10px;
  margin-left: 2px;
`;

const CardioContainer = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const CardioCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
  min-width: 120px;
  background-color: #f9f9f9;
  flex: 1;
`;

const CardioCardTitle = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 6px;
  text-align: center;
  padding: 2px;
  background-color: #eee;
  border-radius: 4px;
`;

const CardioInfoText = styled.small`
  margin-top: 5px;
  display: block;
  font-size: 11px;
  text-align: center;
  color: #666;
`;

const Tooltip = styled.div`
  position: relative;
  &:hover::after {
    content: "시간 또는 거리 중 하나 이상 입력해주세요";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
`;

interface ExerciseSetFormProps {
  exercise: ExerciseDTO;
  onRemove: () => void;
  onChange: (sets: RecordDetailDTO[]) => void;
  setCount?: number;
  initialSets?: RecordDetailDTO[];
}

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = ({
  exercise,
  onRemove,
  onChange,
  setCount = 4,
  initialSets,
}) => {
  const isCardio = exercise.exerciseType === "유산소";
  const getDefaultSet = (): RecordDetailDTO => ({
    weight: null,
    reps: null,
    distance: null,
    time: null,
  });

  const [sets, setSets] = useState<RecordDetailDTO[]>(() => {
    if (initialSets && initialSets.length > 0) return initialSets;
    return isCardio
      ? [getDefaultSet()]
      : Array(setCount)
          .fill(0)
          .map(() => getDefaultSet());
  });

  const handleSetChange = (
    index: number,
    field: keyof RecordDetailDTO,
    value: string
  ) => {
    const newSets = [...sets];
    const numValue = value === "" ? null : Number(value);
    newSets[index] = { ...newSets[index], [field]: numValue };
    setSets(newSets);
    onChange(newSets);
  };

  const handleCardioValueChange = (
    field: keyof RecordDetailDTO,
    value: string
  ) => {
    const newSets = [...sets];
    const numValue = value === "" ? null : Number(value);
    newSets[0] = {
      ...newSets[0],
      [field]: field === "time" && numValue !== null ? numValue * 60 : numValue,
    };
    setSets(newSets);
    onChange(newSets);
  };

  const convertSecondsToMinutes = (seconds: number): number => seconds / 60;

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? hours + "시간 " : ""}${
      minutes > 0 ? minutes + "분 " : ""
    }${seconds > 0 ? seconds + "초" : ""}`;
  };

  useEffect(() => {
    if (!isCardio && setCount !== sets.length) {
      const newSets = Array(setCount)
        .fill(0)
        .map((_, i) => (i < sets.length ? sets[i] : getDefaultSet()));
      setSets(newSets);
      onChange(newSets);
    }
  }, [setCount, isCardio, sets]);

  return (
    <Container>
      <ExerciseHeader>
        <ExerciseInfoContainer>
          <ExerciseName>{exercise.exerciseName}</ExerciseName>
          <ExerciseType>({exercise.exerciseType})</ExerciseType>
        </ExerciseInfoContainer>
        <RemoveButton onClick={onRemove}>삭제</RemoveButton>
      </ExerciseHeader>
      {isCardio ? (
        <>
          <CardioContainer>
            <CardioCard as={Tooltip}>
              <CardioCardTitle>시간 (분)</CardioCardTitle>
              <InputField
                type="number"
                min="0"
                step="0.5"
                placeholder="분 단위로 입력"
                value={
                  sets[0]?.time ? convertSecondsToMinutes(sets[0].time) : ""
                }
                onChange={(e) =>
                  handleCardioValueChange("time", e.target.value)
                }
              />
              {sets[0]?.time ? (
                <CardioInfoText>{formatTime(sets[0].time)}</CardioInfoText>
              ) : null}
            </CardioCard>
            <CardioCard as={Tooltip}>
              <CardioCardTitle>거리 (m)</CardioCardTitle>
              <InputField
                type="number"
                min="0"
                step="10"
                placeholder="미터 단위로 입력"
                value={sets[0]?.distance ?? ""}
                onChange={(e) =>
                  handleCardioValueChange("distance", e.target.value)
                }
              />
              {sets[0]?.distance && sets[0].distance >= 1000 ? (
                <CardioInfoText>
                  {(sets[0].distance / 1000).toFixed(2)}km
                </CardioInfoText>
              ) : null}
            </CardioCard>
          </CardioContainer>
        </>
      ) : (
        <SetContainer>
          {sets.map((set, index) => (
            <SetCard key={index}>
              <SetNumber>세트 {index + 1}</SetNumber>
              <InputGroup>
                <InputLabel>
                  무게(kg) <RequiredText>*</RequiredText>
                </InputLabel>
                <InputField
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight ?? ""}
                  onChange={(e) =>
                    handleSetChange(index, "weight", e.target.value)
                  }
                  isRequired
                />
              </InputGroup>
              <InputGroup>
                <InputLabel>
                  횟수 <RequiredText>*</RequiredText>
                </InputLabel>
                <InputField
                  type="number"
                  min="0"
                  value={set.reps ?? ""}
                  onChange={(e) =>
                    handleSetChange(index, "reps", e.target.value)
                  }
                  isRequired
                />
              </InputGroup>
            </SetCard>
          ))}
        </SetContainer>
      )}
    </Container>
  );
};

export default ExerciseSetForm;
