import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import { ExerciseDTO, RecordDetailDTO } from "../../dtos/WorkoutDTO";

// 색상 테마
const COLORS = {
  primary: "#4a90e2",
  primaryDark: "#2a6bba",
  primaryLight: "#e8f2ff",
  primaryHover: "#357ac5",
  secondary: "#f8f9fa",
  secondaryHover: "#e9ecef",
  border: "#dde2e8",
  borderDark: "#c6ccd4",
  text: "#333333",
  textSecondary: "#6c757d",
  textLight: "#adb5bd",
  danger: "#dc3545",
  dangerHover: "#c82333",
  background: "#ffffff",
  cardBackground: "#ffffff",
  success: "#28a745",
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
};

// 간격 및 크기 상수화 - 값 축소
const SPACING = {
  xs: "3px",
  sm: "6px",
  md: "12px",
  lg: "18px",
  xl: "24px",
};

const BORDER_RADIUS = {
  sm: "3px",
  md: "6px",
  lg: "10px",
  round: "50%",
};

const Container = styled.div`
  border-radius: ${BORDER_RADIUS.md};
  background-color: ${COLORS.cardBackground};
  transition: all 0.2s ease;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  padding-bottom: 4px;
  border-bottom: 1px solid ${COLORS.border};
`;

const ExerciseInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
`;

const ExerciseName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${COLORS.text};
`;

const ExerciseType = styled.span`
  font-size: 12px;
  color: ${COLORS.textSecondary};
  background-color: ${COLORS.secondary};
  padding: 2px 6px;
  border-radius: ${BORDER_RADIUS.sm};
`;

const RemoveButton = styled.button`
  background-color: ${COLORS.danger};
  color: white;
  border: none;
  border-radius: ${BORDER_RADIUS.sm};
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLORS.dangerHover};
  }
`;

const SetContainer = styled.div`
  margin-top: ${SPACING.sm};
  display: flex;
  flex-direction: row;
  gap: ${SPACING.sm};
  overflow-x: auto;
  padding-bottom: ${SPACING.sm};
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${COLORS.borderDark};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${COLORS.secondary};
    border-radius: 3px;
  }
`;

const SetCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.sm};
  min-width: 100px;
  max-width: 100px;
  background-color: ${COLORS.background};
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px ${COLORS.shadowLight};

  &:hover {
    border-color: ${COLORS.borderDark};
    box-shadow: 0 2px 4px ${COLORS.shadow};
  }
`;

const SetNumber = styled.div`
  font-weight: 600;
  font-size: 12px;
  margin-bottom: ${SPACING.xs};
  text-align: center;
  padding: 3px;
  background-color: ${COLORS.secondary};
  border-radius: ${BORDER_RADIUS.sm};
  color: ${COLORS.text};
`;

const InputField = styled.input<{ isRequired?: boolean }>`
  padding: 6px;
  border: 1px solid ${(props) => (props.isRequired ? "#ffebee" : COLORS.border)};
  border-radius: ${BORDER_RADIUS.sm};
  width: 100%;
  margin-top: 2px;
  font-size: 13px;
  box-sizing: border-box;
  background-color: ${({ isRequired }) => (isRequired ? "#fff8f8" : "white")};
  color: ${COLORS.text};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 2px ${COLORS.primaryLight};
  }

  &:hover:not(:focus) {
    border-color: ${COLORS.borderDark};
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${SPACING.xs};
`;

const InputLabel = styled.label`
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 1px;
  color: ${COLORS.textSecondary};
  display: flex;
  align-items: center;
`;

const RequiredText = styled.span`
  color: ${COLORS.danger};
  font-size: 9px;
  margin-left: ${SPACING.xs};
`;

const CardioContainer = styled.div`
  margin-top: ${SPACING.sm};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.sm};
`;

const CardioCard = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.sm};
  background-color: ${COLORS.background};
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px ${COLORS.shadowLight};

  &:hover {
    border-color: ${COLORS.borderDark};
    box-shadow: 0 2px 4px ${COLORS.shadow};
  }
`;

const CardioCardTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  margin-bottom: ${SPACING.xs};
  text-align: center;
  padding: 3px;
  background-color: ${COLORS.secondary};
  border-radius: ${BORDER_RADIUS.sm};
  color: ${COLORS.text};
`;

const CardioInfoText = styled.small`
  margin-top: ${SPACING.xs};
  display: block;
  font-size: 11px;
  text-align: center;
  color: ${COLORS.textSecondary};
  background-color: ${COLORS.secondary};
  padding: 3px;
  border-radius: ${BORDER_RADIUS.sm};
`;

const Tooltip = styled.div`
  position: relative;

  &:hover::after {
    content: "시간 또는 거리 중 하나 이상 입력해주세요";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${COLORS.text};
    color: white;
    padding: 4px 8px;
    border-radius: ${BORDER_RADIUS.sm};
    font-size: 11px;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 2px 4px ${COLORS.shadow};
  }
`;

// 새로운 스타일 컴포넌트 추가
const SetControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
`;

const SetControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    background-color: ${COLORS.secondaryHover};
    border-color: ${COLORS.borderDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${COLORS.secondary};
  }
`;

const SetCountText = styled.span`
  font-size: 13px;
  color: ${COLORS.textSecondary};
  min-width: 30px;
  text-align: center;
`;

interface ExerciseSetFormProps {
  exercise: ExerciseDTO;
  onRemove: () => void;
  onChange: (sets: RecordDetailDTO[]) => void;
  setCount?: number;
  initialSets?: RecordDetailDTO[];
  onSetCountChange?: (count: number) => void;
}

const ExerciseSetForm: React.FC<ExerciseSetFormProps> = React.memo(
  ({
    exercise,
    onRemove,
    onChange,
    setCount = 4,
    initialSets,
    onSetCountChange,
  }) => {
    const isCardio = exercise.exerciseType === "유산소";
    const initialSetCount = initialSets?.length || setCount;
    const [localSetCount, setLocalSetCount] = useState(initialSetCount);

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
        : Array(initialSetCount)
            .fill(0)
            .map(() => getDefaultSet());
    });

    // 세트 추가 함수
    const handleAddSet = useCallback(() => {
      if (isCardio) return;

      const newSetCount = localSetCount + 1;
      setLocalSetCount(newSetCount);

      const newSets = [...sets, getDefaultSet()];
      setSets(newSets);
      onChange(newSets);

      // 부모 컴포넌트에게 세트 수 변경 알림
      if (onSetCountChange) {
        onSetCountChange(newSetCount);
      }

      // 새 세트에 대한 입력 값 초기화
      setInputValues((prev) => ({
        ...prev,
        [`weight-${newSetCount - 1}`]: "",
        [`reps-${newSetCount - 1}`]: "",
      }));
    }, [
      isCardio,
      localSetCount,
      sets,
      getDefaultSet,
      onChange,
      onSetCountChange,
    ]);

    // 세트 삭제 함수
    const handleRemoveSet = useCallback(() => {
      if (isCardio || localSetCount <= 1) return;

      const newSetCount = localSetCount - 1;
      setLocalSetCount(newSetCount);

      const newSets = sets.slice(0, -1);
      setSets(newSets);
      onChange(newSets);

      // 부모 컴포넌트에게 세트 수 변경 알림
      if (onSetCountChange) {
        onSetCountChange(newSetCount);
      }
    }, [isCardio, localSetCount, sets, onChange, onSetCountChange]);

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

    // 초기 세트 수 또는 initialSets가 변경될 때만 한 번 localSetCount 업데이트
    useEffect(() => {
      if (initialSets?.length) {
        setLocalSetCount(initialSets.length);
      }
    }, [initialSets]);

    // localSetCount 변경 시 세트 업데이트 - 단, 세트 개수가 실제로 변경된 경우에만
    useEffect(() => {
      if (!isCardio && localSetCount !== sets.length) {
        const newSets = Array(localSetCount)
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
    }, [localSetCount, isCardio, onChange, sets, getDefaultSet]);

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
          <div style={{ display: "flex", alignItems: "center" }}>
            {!isCardio && (
              <SetControlGroup>
                <SetControlButton
                  onClick={handleRemoveSet}
                  disabled={localSetCount <= 1}
                  title="세트 삭제"
                >
                  -
                </SetControlButton>
                <SetCountText>{localSetCount}세트</SetCountText>
                <SetControlButton onClick={handleAddSet} title="세트 추가">
                  +
                </SetControlButton>
              </SetControlGroup>
            )}
            <RemoveButton onClick={onRemove}>삭제</RemoveButton>
          </div>
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
