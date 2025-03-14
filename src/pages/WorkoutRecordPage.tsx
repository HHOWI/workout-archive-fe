import React, { useState, useRef } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExerciseSelector from "../components/ExerciseSelector";
import ExerciseSetForm from "../components/ExerciseSetForm";
import {
  ExerciseDTO,
  ExerciseRecordDTO,
  WorkoutPlaceDTO,
  RecordDetailDTO,
} from "../dtos/WorkoutDTO";
import { saveWorkoutRecordAPI } from "../api/workout";
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
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
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

const PhotoUploadContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
`;

const PhotoUploadHeader = styled.div`
  margin-bottom: 15px;
`;

const PhotoPreviewContainer = styled.div`
  width: 100%;
  height: 200px;
  border: 1px dashed #aaa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  overflow: hidden;
  position: relative;
`;

const PhotoPreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const PhotoUploadInput = styled.input`
  display: none;
`;

const PhotoUploadButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: #357ac5;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const RemovePhotoButton = styled.button`
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;

  &:hover {
    background: #ff7875;
  }
`;

const TextareaContainer = styled.div`
  margin-bottom: 20px;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

// 드래그 관련 스타일 추가
const DraggableItem = styled.div<{ isDragging?: boolean }>`
  margin-bottom: 10px;
  cursor: grab;
  opacity: ${(props) => (props.isDragging ? "0.5" : "1")};

  &:active {
    cursor: grabbing;
  }
`;

const WorkoutRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>("");
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordDTO[]>(
    []
  );
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] =
    useState<WorkoutPlaceDTO | null>(null);
  const [kakaoPlaceOriginal, setKakaoPlaceOriginal] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사진 및 글 작성 상태 추가
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 관련 상태 추가
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const draggedItem = useRef<ExerciseRecordDTO | null>(null);

  // 여러 운동을 한번에 추가하는 함수 (이제 바로 세트 정보와 함께 받음)
  const handleAddExercises = (
    exercisesWithSets: {
      exercise: ExerciseDTO;
      sets: RecordDetailDTO[];
      setCount?: number;
    }[]
  ) => {
    if (exercisesWithSets.length === 0) return;

    // 이미 세트 정보가 포함된 형태로 받기 때문에 간단하게 처리
    const newRecords = exercisesWithSets.map(
      ({ exercise, sets, setCount }) => ({
        exercise,
        sets,
        setCount, // setCount 정보도 함께 저장
      })
    );

    setExerciseRecords((prev) => [...prev, ...newRecords]);
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

    const workoutPlace: WorkoutPlaceDTO = {
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

  // 사진 선택 핸들러
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedPhoto(file);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 사진 제거 핸들러
  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 사진 업로드 버튼 클릭 핸들러
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 글 작성 핸들러
  const handleDiaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiaryText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!date || exerciseRecords.length === 0) {
      alert("날짜와 운동 목록은 필수 입력 항목입니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 및 텍스트 데이터 추가
      const formData = new FormData();

      // 운동 데이터 변환 (변환 과정 간소화)
      const transformedExerciseRecords = exerciseRecords.map((record) => ({
        exercise: {
          exerciseSeq: record.exercise.exerciseSeq,
          exerciseType: record.exercise.exerciseType,
          exerciseName: record.exercise.exerciseName,
        },
        sets: record.sets,
      }));

      // JSON 데이터
      const workoutData = {
        date: date.toISOString().split("T")[0],
        location: location || "", // 빈 문자열로 기본값 설정
        exerciseRecords: transformedExerciseRecords,
        diary: diaryText,
      };

      // FormData에 JSON 데이터 추가
      formData.append("workoutData", JSON.stringify(workoutData));

      // 사진이 있는 경우 추가
      if (selectedPhoto) {
        formData.append("image", selectedPhoto);
      }

      // 장소 정보가 있는 경우 추가
      if (kakaoPlaceOriginal && kakaoPlaceOriginal.id) {
        const placeInfo = {
          kakaoPlaceId: kakaoPlaceOriginal.id,
          placeName: kakaoPlaceOriginal.place_name,
          addressName: kakaoPlaceOriginal.address_name || "",
          roadAddressName: kakaoPlaceOriginal.road_address_name || "",
          x: kakaoPlaceOriginal.x,
          y: kakaoPlaceOriginal.y,
        };
        formData.append("placeInfo", JSON.stringify(placeInfo));
      }

      await saveWorkoutRecordAPI(formData);
      alert("운동 기록이 성공적으로 저장되었습니다!");
      navigate("/profile");
    } catch (error) {
      console.error("운동 기록 저장 실패:", error);
      alert("운동 기록 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 드래그 시작 핸들러
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    draggedItem.current = exerciseRecords[index];
  };

  // 드래그 오버 핸들러
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // 현재 순서 복사
    const newRecords = [...exerciseRecords];

    // 드래그한 아이템 제거
    const draggedRecord = newRecords.splice(draggedIndex, 1)[0];

    // 새 위치에 아이템 삽입
    newRecords.splice(index, 0, draggedRecord);

    // 상태 업데이트
    setExerciseRecords(newRecords);
    setDraggedIndex(index);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setDraggedIndex(null);
    draggedItem.current = null;
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
        <Label>운동 장소 (선택사항)</Label>
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

      {/* 사진 업로드 섹션 추가 */}
      <PhotoUploadContainer>
        <PhotoUploadHeader>
          <Label>운동 사진 (선택사항)</Label>
        </PhotoUploadHeader>
        <PhotoPreviewContainer>
          {photoPreview ? (
            <PhotoPreview src={photoPreview} alt="운동 사진 미리보기" />
          ) : (
            <span>사진을 업로드해주세요</span>
          )}
        </PhotoPreviewContainer>
        <div>
          <PhotoUploadInput
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            ref={fileInputRef}
          />
          <PhotoUploadButton type="button" onClick={handleUploadButtonClick}>
            사진 선택
          </PhotoUploadButton>
          {photoPreview && (
            <RemovePhotoButton type="button" onClick={handleRemovePhoto}>
              사진 제거
            </RemovePhotoButton>
          )}
        </div>
      </PhotoUploadContainer>

      {/* 글 작성 섹션 추가 */}
      <TextareaContainer>
        <Label>오늘의 운동 일기 (선택사항)</Label>
        <StyledTextarea
          placeholder="오늘 운동에 대한 생각이나 느낌을 기록해보세요."
          value={diaryText}
          onChange={handleDiaryChange}
        />
      </TextareaContainer>

      <ExercisesContainer>
        <Label>운동 목록</Label>
        {exerciseRecords.map((record, index) => (
          <DraggableItem
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            isDragging={index === draggedIndex}
          >
            <ExerciseSetForm
              exercise={record.exercise}
              onRemove={() => handleRemoveExercise(index)}
              onChange={(sets) => handleSetsChange(index, sets)}
              setCount={record.setCount}
            />
          </DraggableItem>
        ))}

        <AddExerciseButton onClick={() => setShowExerciseSelector(true)}>
          + 운동 추가하기
        </AddExerciseButton>
      </ExercisesContainer>

      <SubmitButton
        disabled={isSubmitting || !date || exerciseRecords.length === 0}
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
            <ExerciseSelector
              onSelectExercises={handleAddExercises}
              onCancel={() => setShowExerciseSelector(false)}
            />
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
