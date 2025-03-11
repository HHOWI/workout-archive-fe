import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Exercise, RecordDetail } from "../dtos/WorkoutDTO";

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

const InputField = styled.input`
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-top: 3px;
  font-size: 13px;
  box-sizing: border-box;
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

const OptionalText = styled.span`
  font-weight: normal;
  font-size: 10px;
  color: #888;
  margin-left: 2px;
`;

interface ExerciseSetFormProps {
  exercise: Exercise;
  onRemove: () => void;
  onChange: (sets: RecordDetail[]) => void;
  setCount?: number;
}

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = ({
  exercise,
  onRemove,
  onChange,
  setCount = 4,
}) => {
  const isCardio = exercise.exerciseType === "유산소";

  // 초기 세트 설정 - 유산소 운동의 경우 시간은 0분(0초)으로 설정
  const getDefaultSet = (): RecordDetail => {
    return isCardio ? { time: 0, distance: 0 } : { weight: 0, reps: 0 };
  };

  // 세트 수를 props로 받은 setCount에 맞게 초기화
  const [sets, setSets] = useState<RecordDetail[]>(
    isCardio
      ? [getDefaultSet()] // 유산소는 항상 1세트
      : Array(setCount)
          .fill(0)
          .map(() => getDefaultSet()) // 근력 운동은 지정된 세트 수
  );

  // setCount가 변경되면 세트 배열 업데이트
  useEffect(() => {
    if (!isCardio && setCount !== sets.length) {
      const newSets = Array(setCount)
        .fill(0)
        .map((_, i) =>
          // 기존 세트 데이터를 유지하거나 새 세트 추가
          i < sets.length ? sets[i] : getDefaultSet()
        );
      setSets(newSets);
      onChange(newSets);
    }
  }, [setCount, isCardio]);

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    // 최초 렌더링 시 부모에게 기본 세트 전달
    onChange(sets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 운동 타입이 변경될 때만 세트 필드 타입 업데이트
  useEffect(() => {
    // 필드만 바꾸고 세트 수는 유지
    const updatedSets = isCardio
      ? [getDefaultSet()]
      : Array(setCount)
          .fill(0)
          .map(() => getDefaultSet());

    setSets(updatedSets);
    onChange(updatedSets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCardio]);

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

  // 유산소 운동의 경우 단일 세트의 값 변경
  const handleCardioValueChange = (
    field: keyof RecordDetail,
    value: number
  ) => {
    const newSets = [...sets];

    // 시간이 분 단위로 입력된 경우 초 단위로 변환
    if (field === "time") {
      // 분 단위 입력을 초 단위로 변환 (1분 = 60초)
      const seconds = value * 60;
      newSets[0] = { ...newSets[0], [field]: seconds };
    } else {
      newSets[0] = { ...newSets[0], [field]: value };
    }

    setSets(newSets);
    onChange(newSets);
  };

  // 초 단위 값을 분 단위로 변환 (UI 표시용)
  const convertSecondsToMinutes = (seconds: number): number => {
    return seconds / 60;
  };

  // 시간을 시/분/초 형식으로 변환하는 함수
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours > 0 ? hours + "시간 " : ""}${
      minutes > 0 ? minutes + "분 " : ""
    }${seconds > 0 ? seconds + "초" : ""}`;
  };

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
        // 유산소 운동도 카드 스타일로 통일
        <>
          <CardioContainer>
            <CardioCard>
              <CardioCardTitle>
                시간 (분) <OptionalText>(선택)</OptionalText>
              </CardioCardTitle>
              <InputField
                type="number"
                min="0"
                step="0.5"
                placeholder="분 단위로 입력"
                value={
                  sets[0]?.time ? convertSecondsToMinutes(sets[0].time) : ""
                }
                onChange={(e) =>
                  handleCardioValueChange("time", Number(e.target.value))
                }
              />
              {sets[0]?.time ? (
                <CardioInfoText>
                  {formatTime(Number(sets[0].time))}
                </CardioInfoText>
              ) : null}
            </CardioCard>

            <CardioCard>
              <CardioCardTitle>
                거리 (m) <OptionalText>(선택)</OptionalText>
              </CardioCardTitle>
              <InputField
                type="number"
                min="0"
                step="10"
                placeholder="미터 단위로 입력"
                value={sets[0]?.distance || ""}
                onChange={(e) =>
                  handleCardioValueChange("distance", Number(e.target.value))
                }
              />
              {sets[0]?.distance && sets[0].distance >= 1000 ? (
                <CardioInfoText>
                  {(Number(sets[0].distance) / 1000).toFixed(2)}km
                </CardioInfoText>
              ) : null}
            </CardioCard>
          </CardioContainer>
        </>
      ) : (
        // 근력 운동인 경우 세트를 가로로 배치
        <SetContainer>
          {sets.map((set, index) => (
            <SetCard key={index}>
              <SetNumber>세트 {index + 1}</SetNumber>

              <InputGroup>
                <InputLabel>무게(kg)</InputLabel>
                <InputField
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight || ""}
                  onChange={(e) =>
                    handleSetChange(index, "weight", Number(e.target.value))
                  }
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>횟수</InputLabel>
                <InputField
                  type="number"
                  min="0"
                  value={set.reps || ""}
                  onChange={(e) =>
                    handleSetChange(index, "reps", Number(e.target.value))
                  }
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
