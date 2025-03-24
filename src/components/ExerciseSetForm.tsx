import React, { useState, useEffect, useRef, useCallback } from "react";
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
  &:focus {
    outline: 1px solid #4a90e2;
    border-color: #4a90e2;
  }
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

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = React.memo(
  ({ exercise, onRemove, onChange, setCount = 4, initialSets }) => {
    const isCardio = exercise.exerciseType === "유산소";

    // 기본 세트 생성 함수
    const getDefaultSet = useCallback(
      (): RecordDetailDTO => ({
        weight: null,
        reps: null,
        distance: null,
        time: null,
      }),
      []
    );

    // 초기 세트 데이터 설정
    const [sets, setSets] = useState<RecordDetailDTO[]>(() => {
      if (initialSets && initialSets.length > 0) {
        return initialSets.map((set) => ({
          weight: set.weight === 0 ? null : set.weight,
          reps: set.reps === 0 ? null : set.reps,
          distance: set.distance === 0 ? null : set.distance,
          time: set.time === 0 ? null : set.time,
        }));
      }
      return isCardio
        ? [getDefaultSet()]
        : Array(setCount)
            .fill(0)
            .map(() => getDefaultSet());
    });

    // 입력 필드 값 관리
    const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
      sets.reduce((acc, set, index) => {
        acc[`weight-${index}`] = set.weight?.toString() ?? "";
        acc[`reps-${index}`] = set.reps?.toString() ?? "";
        acc[`time-0`] = set.time ? (set.time / 60).toString() : "";
        acc[`distance-0`] = set.distance?.toString() ?? "";
        return acc;
      }, {} as Record<string, string>)
    );

    // Input 요소 참조 저장
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // 부모 컴포넌트에 변경사항 전달
    const updateParent = useCallback(
      (newSets: RecordDetailDTO[]) => {
        const currentSetsJSON = JSON.stringify(sets);
        const newSetsJSON = JSON.stringify(newSets);

        // 실제 값이 변경된 경우만 부모에게 알림
        if (currentSetsJSON !== newSetsJSON) {
          setSets(newSets);
          onChange(newSets);
        }
      },
      [sets, onChange]
    );

    // 입력 변경 시 로컬 상태만 업데이트
    const handleInputChange = useCallback((key: string, value: string) => {
      setInputValues((prev) => ({ ...prev, [key]: value }));
    }, []);

    // 입력 필드에서 포커스 벗어날 때 상태 업데이트
    const handleInputBlur = useCallback(
      (
        key: string,
        value: string,
        index: number,
        field: keyof RecordDetailDTO
      ) => {
        const numValue = value === "" ? null : Number(value);
        const newSets = [...sets];

        newSets[index] = {
          ...newSets[index],
          [field]:
            field === "time" && numValue !== null ? numValue * 60 : numValue,
        };

        updateParent(newSets);
      },
      [sets, updateParent]
    );

    // 키보드 이벤트 처리 - Enter 키로 다음 필드 이동
    const handleKeyDown = useCallback((e: React.KeyboardEvent, key: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const allKeys = Object.keys(inputRefs.current).filter(
          (k) => inputRefs.current[k] !== null
        );
        const currentIndex = allKeys.indexOf(key);
        if (currentIndex >= 0 && currentIndex < allKeys.length - 1) {
          const nextKey = allKeys[currentIndex + 1];
          inputRefs.current[nextKey]?.focus();
        }
      }
    }, []);

    // 즉시 포커스 설정을 위한 마우스 다운 핸들러
    const handleMouseDown = useCallback((e: React.MouseEvent, key: string) => {
      e.stopPropagation(); // 이벤트 버블링 방지

      // 다음 프레임에 포커스 설정 (렌더링 사이클 이후)
      requestAnimationFrame(() => {
        if (inputRefs.current[key]) {
          inputRefs.current[key]?.focus();
        }
      });
    }, []);

    // 세트 수 변경 시 세트 업데이트
    useEffect(() => {
      if (!isCardio && setCount !== sets.length) {
        const newSets = Array(setCount)
          .fill(0)
          .map((_, i) => (i < sets.length ? sets[i] : getDefaultSet()));

        // 입력 값도 함께 업데이트
        setInputValues(
          newSets.reduce((acc, set, index) => {
            acc[`weight-${index}`] = set.weight?.toString() ?? "";
            acc[`reps-${index}`] = set.reps?.toString() ?? "";
            return acc;
          }, {} as Record<string, string>)
        );

        setSets(newSets);
        onChange(newSets);
      }
    }, [setCount, isCardio, onChange, sets.length, getDefaultSet]);

    // 시간 포맷팅 함수
    const formatTime = useCallback((totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours > 0 ? hours + "시간 " : ""}${
        minutes > 0 ? minutes + "분 " : ""
      }${seconds > 0 ? seconds + "초" : ""}`;
    }, []);

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
          <CardioContainer>
            <CardioCard as={Tooltip}>
              <CardioCardTitle>시간 (분)</CardioCardTitle>
              <InputField
                type="number"
                min="0"
                step="0.5"
                placeholder="분 단위로 입력"
                value={inputValues["time-0"] ?? ""}
                onChange={(e) => handleInputChange("time-0", e.target.value)}
                onBlur={(e) =>
                  handleInputBlur("time-0", e.target.value, 0, "time")
                }
                onMouseDown={(e) => handleMouseDown(e, "time-0")}
                onKeyDown={(e) => handleKeyDown(e, "time-0")}
                ref={(el) => (inputRefs.current["time-0"] = el)}
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
                value={inputValues["distance-0"] ?? ""}
                onChange={(e) =>
                  handleInputChange("distance-0", e.target.value)
                }
                onBlur={(e) =>
                  handleInputBlur("distance-0", e.target.value, 0, "distance")
                }
                onMouseDown={(e) => handleMouseDown(e, "distance-0")}
                onKeyDown={(e) => handleKeyDown(e, "distance-0")}
                ref={(el) => (inputRefs.current["distance-0"] = el)}
              />
              {sets[0]?.distance && sets[0].distance >= 1000 ? (
                <CardioInfoText>
                  {(sets[0].distance / 1000).toFixed(2)}km
                </CardioInfoText>
              ) : null}
            </CardioCard>
          </CardioContainer>
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
                    value={inputValues[`weight-${index}`] ?? ""}
                    onChange={(e) =>
                      handleInputChange(`weight-${index}`, e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputBlur(
                        `weight-${index}`,
                        e.target.value,
                        index,
                        "weight"
                      )
                    }
                    onMouseDown={(e) => handleMouseDown(e, `weight-${index}`)}
                    onKeyDown={(e) => handleKeyDown(e, `weight-${index}`)}
                    ref={(el) => (inputRefs.current[`weight-${index}`] = el)}
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
                    value={inputValues[`reps-${index}`] ?? ""}
                    onChange={(e) =>
                      handleInputChange(`reps-${index}`, e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputBlur(
                        `reps-${index}`,
                        e.target.value,
                        index,
                        "reps"
                      )
                    }
                    onMouseDown={(e) => handleMouseDown(e, `reps-${index}`)}
                    onKeyDown={(e) => handleKeyDown(e, `reps-${index}`)}
                    ref={(el) => (inputRefs.current[`reps-${index}`] = el)}
                    isRequired
                  />
                </InputGroup>
              </SetCard>
            ))}
          </SetContainer>
        )}
      </Container>
    );
  },
  (prevProps, nextProps) =>
    prevProps.exercise.exerciseSeq === nextProps.exercise.exerciseSeq &&
    prevProps.setCount === nextProps.setCount &&
    JSON.stringify(prevProps.initialSets) ===
      JSON.stringify(nextProps.initialSets)
);

export default ExerciseSetForm;
