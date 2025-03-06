import React, { useState } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExerciseSelector from "../components/ExerciseSelector";
import ExerciseSetForm from "../components/ExerciseSetForm";
import {
  Exercise,
  ExerciseRecord,
  WorkoutOfTheDay,
} from "../types/WorkoutTypes";
import { saveWorkoutRecord } from "../api/workout";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ExercisesContainer = styled.div`
  margin-top: 30px;
`;

const AddExerciseButton = styled.button`
  background: none;
  border: 1px dashed #aaa;
  border-radius: 8px;
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f5f5f5;
  }
`;

const SubmitButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;

  &:hover {
    background: #357ac5;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const CustomDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const WorkoutRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    setExerciseRecords([
      ...exerciseRecords,
      { exercise, sets: [{ weight: 0, reps: 0 }] },
    ]);
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    const newRecords = [...exerciseRecords];
    newRecords.splice(index, 1);
    setExerciseRecords(newRecords);
  };

  const handleSetsChange = (index: number, sets: any[]) => {
    const newRecords = [...exerciseRecords];
    newRecords[index].sets = sets;
    setExerciseRecords(newRecords);
  };

  const handleSubmit = async () => {
    if (!date || !location || exerciseRecords.length === 0) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const workoutData: WorkoutOfTheDay = {
        date: date.toISOString().split("T")[0],
        location,
        exerciseRecords,
      };

      await saveWorkoutRecord(workoutData);
      alert("운동 기록이 성공적으로 저장되었습니다!");
      navigate("/workout-history");
    } catch (error) {
      console.error("운동 기록 저장 실패:", error);
      alert("운동 기록 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>오늘의 운동 기록</Title>

      <FormGroup>
        <Label>운동 날짜</Label>
        <CustomDatePickerWrapper>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => date && setDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </CustomDatePickerWrapper>
      </FormGroup>

      <FormGroup>
        <Label>운동 장소</Label>
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="예: 홈짐, OO휘트니스 센터"
        />
      </FormGroup>

      <ExercisesContainer>
        <Label>운동 목록</Label>
        {exerciseRecords.map((record, index) => (
          <ExerciseSetForm
            key={index}
            exercise={record.exercise}
            onRemove={() => handleRemoveExercise(index)}
            onChange={(sets) => handleSetsChange(index, sets)}
          />
        ))}

        <AddExerciseButton onClick={() => setShowExerciseSelector(true)}>
          + 운동 추가하기
        </AddExerciseButton>
      </ExercisesContainer>

      <SubmitButton
        disabled={
          isSubmitting || !date || !location || exerciseRecords.length === 0
        }
        onClick={handleSubmit}
      >
        {isSubmitting ? "저장 중..." : "기록 저장하기"}
      </SubmitButton>

      {showExerciseSelector && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>운동 선택</h2>
              <CloseButton onClick={() => setShowExerciseSelector(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ExerciseSelector onSelectExercise={handleAddExercise} />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default WorkoutRecordPage;
