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
  WorkoutPlace,
} from "../types/WorkoutTypes";
import { saveWorkoutRecord } from "../api/workout";
import KakaoMapPlaceSelector from "../components/KakaoMapPlaceSelector";

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
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const LocationDisplay = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LocationInfo = styled.div`
  flex: 1;
`;

const LocationName = styled.div`
  font-weight: 600;
  margin-bottom: 3px;
`;

const LocationAddress = styled.div`
  font-size: 14px;
  color: #666;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #ff5252;
  cursor: pointer;
  padding: 5px;

  &:hover {
    text-decoration: underline;
  }
`;

const SelectLocationButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;

  svg {
    margin-right: 8px;
  }

  &:hover {
    background: #e8e8e8;
  }
`;

const WorkoutRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>("");
  const [locationDisplayName, setLocationDisplayName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkoutPlace | null>(
    null
  );
  const [kakaoPlaceOriginal, setKakaoPlaceOriginal] = useState<any>(null);
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

  const handleLocationSelect = (place: any) => {
    setKakaoPlaceOriginal(place);

    const workoutPlace: WorkoutPlace = {
      workoutPlaceSeq: 0,
      kakaoPlaceId: place.id,
      placeName: place.place_name,
      addressName: place.address_name || "",
      roadAddressName: place.road_address_name || "",
      x: place.x,
      y: place.y,
      placeAddress: place.road_address_name || place.address_name || "",
    };

    setSelectedLocation(workoutPlace);
    setLocation(place.place_name);
    setShowLocationModal(false);
  };

  const handleRemoveLocation = () => {
    setSelectedLocation(null);
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

      let placeInfo = undefined;
      if (kakaoPlaceOriginal && kakaoPlaceOriginal.id) {
        placeInfo = {
          kakaoPlaceId: kakaoPlaceOriginal.id,
          placeName: kakaoPlaceOriginal.place_name,
          addressName: kakaoPlaceOriginal.address_name || "",
          roadAddressName: kakaoPlaceOriginal.road_address_name || "",
          x: kakaoPlaceOriginal.x,
          y: kakaoPlaceOriginal.y,
        };
      }

      await saveWorkoutRecord(workoutData, placeInfo);
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
        {selectedLocation ? (
          <LocationDisplay>
            <LocationInfo>
              <LocationName>{selectedLocation.placeName}</LocationName>
              <LocationAddress>
                {selectedLocation.roadAddressName ||
                  selectedLocation.addressName ||
                  selectedLocation.placeAddress ||
                  ""}
              </LocationAddress>
            </LocationInfo>
            <RemoveButton onClick={handleRemoveLocation}>삭제</RemoveButton>
          </LocationDisplay>
        ) : (
          <SelectLocationButton onClick={() => setShowLocationModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
            장소 선택하기
          </SelectLocationButton>
        )}
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

      {/* 운동 선택 모달 */}
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

      {/* 장소 선택 모달 */}
      {showLocationModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>운동 장소 선택</ModalTitle>
              <CloseButton onClick={() => setShowLocationModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <KakaoMapPlaceSelector onPlaceSelect={handleLocationSelect} />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default WorkoutRecordPage;
