import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { ExerciseDTO, RecordDetailDTO } from "../../dtos/WorkoutDTO";
import { fetchExercisesAPI } from "../../api/exercise";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from "../../styles/WorkoutRecordStyles";

// 모달 전체 컨테이너 - 고정 높이로 설정
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 600px; // 고정 높이로 변경
  background-color: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  overflow: hidden;
`;

// 모달 헤더 - 검색창과 카테고리 필터 포함
const Header = styled.div`
  padding: ${SPACING.md};
  border-bottom: 1px solid ${COLORS.border};
  background-color: ${COLORS.background};
  width: 100%;
  box-sizing: border-box;
`;

// 검색 입력창
const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  margin-bottom: ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: 15px;
  color: ${COLORS.text};
  background-color: ${COLORS.background};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

// 카테고리 필터 컨테이너
const CategoryFilter = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: ${SPACING.sm};
  overflow-x: auto;
  padding-bottom: ${SPACING.xs};
  width: 100%;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${COLORS.borderDark};
    border-radius: 10px;
  }
`;

// 카테고리 버튼
const CategoryButton = styled.button<{ isActive: boolean }>`
  padding: 6px 14px;
  border: 1px solid
    ${(props) => (props.isActive ? COLORS.primary : COLORS.border)};
  border-radius: 20px;
  background: ${(props) =>
    props.isActive ? COLORS.primary : COLORS.background};
  color: ${(props) => (props.isActive ? "white" : COLORS.text)};
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  font-weight: ${(props) => (props.isActive ? 600 : 400)};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${(props) =>
      props.isActive ? COLORS.primaryHover : COLORS.secondaryHover};
    border-color: ${(props) =>
      props.isActive ? COLORS.primaryHover : COLORS.borderDark};
  }
`;

// 모달 본문 - 선택된 운동 목록과 전체 운동 목록 포함
const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${SPACING.md};
  box-sizing: border-box;
  width: 100%;
`;

// 섹션 제목
const SectionTitle = styled.h4`
  margin: ${SPACING.sm} 0 ${SPACING.xs} 0;
  color: ${COLORS.text};
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

// 뱃지 스타일
const Badge = styled.span`
  background-color: ${COLORS.primaryLight};
  color: ${COLORS.primary};
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

// 선택된 운동 섹션
const SelectedExercisesSection = styled.div`
  margin-bottom: ${SPACING.md};
  flex-shrink: 0;
`;

// 선택된 운동 목록 컨테이너
const SelectedExercisesContainer = styled.div<{ isEmpty: boolean }>`
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  height: 120px;
  background-color: ${(props) =>
    props.isEmpty ? COLORS.background : COLORS.secondary};
  box-shadow: inset 0 1px 3px ${COLORS.shadowLight};
  overflow-y: ${(props) => (props.isEmpty ? "hidden" : "auto")};
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${COLORS.borderDark};
    border-radius: 4px;
  }
`;

// 선택된 운동 항목
const SelectedExerciseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${COLORS.border};
  background-color: ${COLORS.background};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${COLORS.secondaryHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

// 전체 운동 섹션
const ExerciseSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: ${SPACING.md};
`;

// 전체 운동 목록 컨테이너
const ExerciseList = styled.div<{ isEmpty: boolean }>`
  flex: 1;
  overflow-y: ${(props) => (props.isEmpty ? "hidden" : "auto")};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  background-color: ${(props) =>
    props.isEmpty ? COLORS.background : COLORS.secondary};
  box-shadow: inset 0 1px 3px ${COLORS.shadowLight};
  height: 100%;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${COLORS.borderDark};
    border-radius: 4px;
  }
`;

// 운동 항목
const ExerciseItem = styled.div<{ isSelected: boolean }>`
  padding: 10px 12px;
  border-bottom: 1px solid ${COLORS.border};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.isSelected ? COLORS.primaryLight : COLORS.background};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? COLORS.primaryLight : COLORS.secondaryHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

// 운동 정보 컨테이너
const ExerciseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

// 운동 이름
const ExerciseName = styled.span`
  font-weight: 500;
  color: ${COLORS.text};
  font-size: 14px;
`;

// 운동 유형 레이블
const ExerciseTypeLabel = styled.span`
  font-size: 12px;
  color: ${COLORS.textSecondary};
  padding: 2px 6px;
  background-color: ${COLORS.secondary};
  border-radius: 10px;
`;

// 세트 입력 래퍼
const SetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
  margin-right: ${SPACING.sm};
`;

// 세트 수 입력
const SetInput = styled.input`
  width: 45px;
  padding: 4px 6px;
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: 13px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

// 세트 레이블
const SetLabel = styled.label`
  font-size: 13px;
  color: ${COLORS.textSecondary};
`;

// 삭제 버튼
const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${COLORS.danger};
  color: white;
  border: none;
  border-radius: ${BORDER_RADIUS.sm};
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${COLORS.dangerHover};
  }
`;

// 체크 아이콘
const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${COLORS.primary};
  color: white;
  font-size: 11px;
  font-weight: bold;
`;

// 빈 상태 메시지
const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${COLORS.textSecondary};
  font-size: 14px;
  padding: 0;
  text-align: center;
  background-color: ${COLORS.background};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
`;

// 아이콘
const Icon = styled.div`
  font-size: 24px;
  margin-bottom: ${SPACING.md};
`;

// 로딩 컨테이너
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${COLORS.textSecondary};
  background-color: ${COLORS.background};
`;

// 액션 버튼 컨테이너
const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${SPACING.md};
  padding: ${SPACING.md};
  background-color: ${COLORS.background};
  border-top: 1px solid ${COLORS.border};
  width: 100%;
  box-sizing: border-box;
`;

// 액션 버튼 기본 스타일
const ActionButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
`;

// 추가 버튼
const AddButton = styled(ActionButton)`
  background-color: ${COLORS.primary};
  color: white;
  flex: 2;

  &:hover {
    background-color: ${COLORS.primaryHover};
  }

  &:disabled {
    background-color: ${COLORS.textLight};
    cursor: not-allowed;
  }
`;

// 취소 버튼
const CancelButton = styled(ActionButton)`
  background-color: ${COLORS.secondary};
  color: ${COLORS.textSecondary};
  flex: 1;
  border: 1px solid ${COLORS.border};

  &:hover {
    background-color: ${COLORS.secondaryHover};
    color: ${COLORS.text};
  }
`;

interface ExerciseSelectorProps {
  onSelectExercises: (
    exercises: {
      exercise: ExerciseDTO;
      sets: RecordDetailDTO[];
      setCount?: number;
    }[]
  ) => void;
  onCancel: () => void;
}

interface SelectedExerciseWithSets {
  exercise: ExerciseDTO;
  setCount: number;
}

/**
 * 운동 선택 컴포넌트
 */
const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onSelectExercises,
  onCancel,
}) => {
  // 상태 관리
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExerciseWithSets[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 운동 목록 불러오기
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExercisesAPI();
        setExercises(data);
        setIsLoading(false);
      } catch (error) {
        console.error("운동 목록을 불러오는데 실패했습니다:", error);
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    return [...new Set(exercises.map((ex) => ex.exerciseType))];
  }, [exercises]);

  // 필터링된 운동 목록
  const filteredExercises = useMemo(() => {
    let result = exercises;

    // 카테고리 필터링
    if (selectedCategory) {
      result = result.filter((ex) => ex.exerciseType === selectedCategory);
    }

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter((ex) =>
        ex.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [searchTerm, selectedCategory, exercises]);

  /**
   * 카테고리 선택 핸들러
   */
  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  /**
   * 운동 항목 선택/해제 핸들러
   */
  const handleExerciseClick = (exercise: ExerciseDTO) => {
    setSelectedExercises((prev) => {
      // 이미 선택된 운동인지 확인
      const isAlreadySelected = prev.some(
        (ex) => ex.exercise.exerciseSeq === exercise.exerciseSeq
      );

      if (isAlreadySelected) {
        // 이미 선택된 경우 제거
        return prev.filter(
          (ex) => ex.exercise.exerciseSeq !== exercise.exerciseSeq
        );
      } else {
        // 선택되지 않은 경우 추가
        const isCardio = exercise.exerciseType === "유산소";
        const defaultSetCount = isCardio ? 1 : 4;

        return [
          ...prev,
          {
            exercise,
            setCount: defaultSetCount,
          },
        ];
      }
    });
  };

  /**
   * 세트 수 변경 핸들러
   */
  const handleSetCountChange = (exerciseSeq: number, count: number) => {
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.exercise.exerciseSeq === exerciseSeq
          ? { ...item, setCount: count }
          : item
      )
    );
  };

  /**
   * 선택된 운동 제거 핸들러
   */
  const handleRemoveSelectedExercise = (exerciseSeq: number) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exercise.exerciseSeq !== exerciseSeq)
    );
  };

  /**
   * 선택된 운동 추가 핸들러
   */
  const handleAddExercises = () => {
    if (selectedExercises.length > 0) {
      // 선택된 운동과 세트 수를 기반으로 데이터 구성
      const exercisesWithSets = selectedExercises.map((item) => {
        const { exercise, setCount } = item;
        const isCardio = exercise.exerciseType === "유산소";

        // 세트 생성
        const sets = Array(isCardio ? 1 : setCount)
          .fill(0)
          .map(() =>
            isCardio ? { time: 0, distance: 0 } : { weight: 0, reps: 0 }
          );

        return {
          exercise,
          sets,
          setCount: isCardio ? undefined : setCount,
        };
      });

      onSelectExercises(exercisesWithSets);
    }
  };

  // 결과가 비어있는지 여부를 확인
  const isSelectedEmpty = selectedExercises.length === 0;
  const isResultsEmpty = filteredExercises.length === 0 || isLoading;

  return (
    <Container>
      {/* 헤더 영역 - 검색 및 필터링 */}
      <Header>
        <SearchInput
          type="text"
          placeholder="운동 이름 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CategoryFilter>
          {categories.map((category) => (
            <CategoryButton
              key={category}
              isActive={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </CategoryFilter>
      </Header>

      {/* 본문 영역 */}
      <Content>
        {/* 선택된 운동 목록 */}
        <SelectedExercisesSection>
          <SectionTitle>
            선택된 운동 <Badge>{selectedExercises.length}개</Badge>
          </SectionTitle>
          <SelectedExercisesContainer isEmpty={isSelectedEmpty}>
            {selectedExercises.length > 0 ? (
              selectedExercises.map((item) => {
                const isCardio = item.exercise.exerciseType === "유산소";
                return (
                  <SelectedExerciseItem key={item.exercise.exerciseSeq}>
                    <ExerciseInfo>
                      <ExerciseName>{item.exercise.exerciseName}</ExerciseName>
                      <ExerciseTypeLabel>
                        {item.exercise.exerciseType}
                      </ExerciseTypeLabel>
                    </ExerciseInfo>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!isCardio && (
                        <SetInputWrapper>
                          <SetLabel>세트:</SetLabel>
                          <SetInput
                            type="number"
                            min="1"
                            max="10"
                            value={item.setCount}
                            onChange={(e) =>
                              handleSetCountChange(
                                item.exercise.exerciseSeq,
                                Math.max(
                                  1,
                                  Math.min(10, parseInt(e.target.value) || 1)
                                )
                              )
                            }
                          />
                        </SetInputWrapper>
                      )}
                      <RemoveButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSelectedExercise(
                            item.exercise.exerciseSeq
                          );
                        }}
                      >
                        삭제
                      </RemoveButton>
                    </div>
                  </SelectedExerciseItem>
                );
              })
            ) : (
              <EmptyMessage>
                <Icon>📋</Icon>
                아래 목록에서 운동을 선택하세요
              </EmptyMessage>
            )}
          </SelectedExercisesContainer>
        </SelectedExercisesSection>

        {/* 운동 목록 */}
        <ExerciseSection>
          <SectionTitle>전체 운동 목록</SectionTitle>
          <ExerciseList isEmpty={isResultsEmpty}>
            {isLoading ? (
              <LoadingContainer>운동 목록을 불러오는 중...</LoadingContainer>
            ) : filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  (ex) => ex.exercise.exerciseSeq === exercise.exerciseSeq
                );
                return (
                  <ExerciseItem
                    key={exercise.exerciseSeq}
                    onClick={() => handleExerciseClick(exercise)}
                    isSelected={isSelected}
                  >
                    <ExerciseInfo>
                      <ExerciseName>{exercise.exerciseName}</ExerciseName>
                      <ExerciseTypeLabel>
                        {exercise.exerciseType}
                      </ExerciseTypeLabel>
                    </ExerciseInfo>
                    {isSelected && <CheckIcon>✓</CheckIcon>}
                  </ExerciseItem>
                );
              })
            ) : (
              <EmptyMessage>
                <Icon>🔍</Icon>
                검색 결과가 없습니다
              </EmptyMessage>
            )}
          </ExerciseList>
        </ExerciseSection>
      </Content>

      {/* 하단 액션 버튼 */}
      <ActionButtonContainer>
        <CancelButton onClick={onCancel}>취소</CancelButton>
        <AddButton
          onClick={handleAddExercises}
          disabled={selectedExercises.length === 0}
        >
          {selectedExercises.length > 0
            ? `${selectedExercises.length}개 운동 추가하기`
            : "운동 추가하기"}
        </AddButton>
      </ActionButtonContainer>
    </Container>
  );
};

export default ExerciseSelector;
