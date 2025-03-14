import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { ExerciseDTO, RecordDetailDTO } from "../dtos/WorkoutDTO";
import { fetchExercisesAPI } from "../api/exercise";

const Container = styled.div`
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
`;

const CategoryButton = styled.button<{ isActive: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  background: ${(props) => (props.isActive ? "#4a90e2" : "#f0f0f0")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.isActive ? "#4a90e2" : "#e0e0e0")};
  }
`;

const ExerciseList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const ExerciseItem = styled.div<{ isSelected: boolean }>`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.isSelected ? "#e6f7ff" : "transparent"};

  &:hover {
    background-color: ${(props) => (props.isSelected ? "#d6f0ff" : "#f5f5f5")};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SelectedExercisesContainer = styled.div`
  margin-top: 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  height: 180px;
  min-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SelectedExerciseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const ExerciseInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ExerciseName = styled.span`
  margin-right: 8px;
`;

const ExerciseTypeLabel = styled.small`
  color: #666;
`;

const SetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const SetInput = styled.input`
  width: 50px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0 5px;
`;

const SetLabel = styled.label`
  font-size: 14px;
  color: #666;
`;

const RemoveButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 12px;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
`;

const AddButton = styled(ActionButton)`
  background-color: #4a90e2;
  color: white;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #f0f0f0;
  color: #333;
`;

const EmptySelectionMessage = styled.div`
  padding: 15px;
  text-align: center;
  color: #888;
  margin: auto;
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

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onSelectExercises,
  onCancel,
}) => {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExerciseWithSets[]
  >([]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercisesAPI();
        setExercises(data);
        setFilteredExercises(data);

        // 카테고리 추출
        const uniqueCategories = [
          ...new Set(data.map((ex) => ex.exerciseType)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("운동 목록을 불러오는데 실패했습니다:", error);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    let result = exercises;

    // 카테고리 필터링
    if (selectedCategory) {
      result = result.filter((ex) => ex.exerciseType === selectedCategory);
    }

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter((ex) =>
        ex.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(result);
  }, [searchTerm, selectedCategory, exercises]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

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
        // 선택되지 않은 경우 추가 (기본 세트 수 설정)
        const isCardio = exercise.exerciseType === "유산소";
        const defaultSetCount = isCardio ? 1 : 4; // 유산소는 기본 1개, 근력 운동은 기본 4세트로 변경

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

  const handleSetCountChange = (exerciseSeq: number, count: number) => {
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.exercise.exerciseSeq === exerciseSeq
          ? { ...item, setCount: count }
          : item
      )
    );
  };

  const handleRemoveSelectedExercise = (exerciseSeq: number) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exercise.exerciseSeq !== exerciseSeq)
    );
  };

  const handleAddExercises = () => {
    if (selectedExercises.length > 0) {
      // 선택된 운동과 세트 수를 기반으로 데이터 구성
      const exercisesWithSets = selectedExercises.map((item) => {
        const { exercise, setCount } = item;
        const isCardio = exercise.exerciseType === "유산소";

        // 유산소 운동은 세트 개념이 없으므로 1개만 생성
        // 근력 운동은 입력한 세트 수만큼 생성
        const sets = Array(isCardio ? 1 : setCount)
          .fill(0)
          .map(() =>
            isCardio
              ? { time: 0, distance: 0 } // 시간은 0초로 설정 (UI에서는 0분으로 표시)
              : { weight: 0, reps: 0 }
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

  return (
    <Container>
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

      <div>
        <h4>선택된 운동 ({selectedExercises.length}개)</h4>
        <SelectedExercisesContainer>
          {selectedExercises.length > 0 ? (
            selectedExercises.map((item) => {
              const isCardio = item.exercise.exerciseType === "유산소";
              return (
                <SelectedExerciseItem key={item.exercise.exerciseSeq}>
                  <ExerciseInfo>
                    <ExerciseName>{item.exercise.exerciseName}</ExerciseName>
                    <ExerciseTypeLabel>
                      ({item.exercise.exerciseType})
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
                      onClick={() =>
                        handleRemoveSelectedExercise(item.exercise.exerciseSeq)
                      }
                    >
                      삭제
                    </RemoveButton>
                  </div>
                </SelectedExerciseItem>
              );
            })
          ) : (
            <EmptySelectionMessage>
              아래 목록에서 운동을 선택하세요
            </EmptySelectionMessage>
          )}
        </SelectedExercisesContainer>
      </div>

      <ExerciseList>
        {filteredExercises.length > 0 ? (
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
                <span>{exercise.exerciseName}</span>
                {isSelected && <span style={{ color: "#4a90e2" }}>✓</span>}
              </ExerciseItem>
            );
          })
        ) : (
          <ExerciseItem isSelected={false}>검색 결과가 없습니다</ExerciseItem>
        )}
      </ExerciseList>

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
