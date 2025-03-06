import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Exercise } from "../types/WorkoutTypes";
import { fetchExercises } from "../api/exercise";

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
`;

const ExerciseItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }
`;

interface ExerciseSelectorProps {
  onSelectExercise: (exercise: Exercise) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onSelectExercise,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercises();
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

      <ExerciseList>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <ExerciseItem
              key={exercise.exerciseSeq}
              onClick={() => onSelectExercise(exercise)}
            >
              {exercise.exerciseName}
            </ExerciseItem>
          ))
        ) : (
          <ExerciseItem>검색 결과가 없습니다</ExerciseItem>
        )}
      </ExerciseList>
    </Container>
  );
};

export default ExerciseSelector;
