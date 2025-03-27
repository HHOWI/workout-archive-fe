import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
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
  WorkoutOfTheDayDTO,
  WorkoutDetailResponseDTO,
} from "../dtos/WorkoutDTO";
import { SaveWorkoutSchema } from "../schema/WorkoutSchema";
import {
  saveWorkoutRecordAPI,
  getRecentWorkoutRecordsAPI,
  getWorkoutRecordDetailsAPI,
} from "../api/workout";
import KakaoMapPlaceSelector from "../components/KakaoMapPlaceSelector";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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

  max-width: 800px;
  margin: 0 auto;
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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

// 추가: 최근 운동 기록 관련 스타일
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SecondaryButton = styled.button`
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 600;
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

const RecentWorkoutsList = styled.div`
  margin-top: 15px;
`;

const RecentWorkoutItem = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #4a90e2;
  }
`;

const WorkoutDate = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
`;

const WorkoutInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const WorkoutIcon = styled.span`
  margin-right: 8px;
  color: #4a90e2;
`;

const WorkoutExercises = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
`;

const ExerciseItem = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;

  &::before {
    content: "•";
    color: #4a90e2;
    margin-right: 5px;
  }
`;

// 재사용 가능한 메시지 컴포넌트
const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const WorkoutRecordPage: React.FC = () => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const userNickname = useSelector(
    (state: any) => state.auth.userInfo?.userNickname
  );

  // 기본 상태
  const [date, setDate] = useState<Date>(new Date());
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordDTO[]>(
    []
  );
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 상태
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [showRecentWorkoutsModal, setShowRecentWorkoutsModal] = useState(false);

  // 위치 및 운동 관련 상태
  const [selectedLocation, setSelectedLocation] =
    useState<WorkoutPlaceDTO | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutOfTheDayDTO[]>(
    []
  );

  // 로딩 상태
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingRecentWorkouts, setIsLoadingRecentWorkouts] = useState(false);

  // 사진 및 일기 상태
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState<string>("");

  // 드래그 관련 상태
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const draggedItem = useRef<ExerciseRecordDTO | null>(null);

  // 기타 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 메모이제이션된 컴포넌트
  const ExerciseSetFormMemo = useMemo(() => React.memo(ExerciseSetForm), []);

  // 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // 폼 유효성 검사 - 최적화 및 불필요한 검사 제거
  const validateForm = useCallback(() => {
    if (!date || exerciseRecords.length === 0) return false;

    try {
      const workoutData = {
        date: date.toISOString().split("T")[0],
        exerciseRecords: exerciseRecords.map((record) => ({
          exercise: {
            exerciseSeq: record.exercise.exerciseSeq,
            exerciseName: record.exercise.exerciseName,
            exerciseType: record.exercise.exerciseType,
          },
          sets: record.sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
            time: set.time,
            distance: set.distance,
          })),
        })),
        diary: diaryText || null,
      };

      const placeInfo = selectedLocation
        ? {
            kakaoPlaceId: selectedLocation.kakaoPlaceId || "",
            placeName: selectedLocation.placeName,
            addressName: selectedLocation.addressName || "",
            roadAddressName: selectedLocation.roadAddressName || "",
            x: selectedLocation.x?.toString() || "0",
            y: selectedLocation.y?.toString() || "0",
          }
        : undefined;

      return SaveWorkoutSchema.safeParse({ workoutData, placeInfo }).success;
    } catch (error) {
      console.error("폼 유효성 검사 중 오류 발생:", error);
      return false;
    }
  }, [date, exerciseRecords, diaryText, selectedLocation]);

  // 지연된 유효성 검사 트리거
  const triggerValidation = useCallback(() => {
    setTimeout(() => {
      const isValid = validateForm();
      setIsButtonEnabled(isValid);
    }, 100);
  }, [validateForm]);

  // 폼 데이터 변경 핸들러들
  const handleSetsChange = useCallback(
    (index: number, sets: RecordDetailDTO[]) => {
      setExerciseRecords((prevRecords) => {
        const newRecords = [...prevRecords];
        newRecords[index] = {
          ...newRecords[index],
          sets: sets,
        };
        return newRecords;
      });
      triggerValidation();
    },
    [triggerValidation]
  );

  const handleDateChange = useCallback(
    (newDate: Date | null) => {
      if (newDate) {
        setDate(newDate);
        triggerValidation();
      }
    },
    [triggerValidation]
  );

  const handleDiaryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDiaryText(e.target.value);
      triggerValidation();
    },
    [triggerValidation]
  );

  // 장소 관련 핸들러
  const handleLocationSelect = useCallback(
    (place: any) => {
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
      setShowLocationModal(false);
      triggerValidation();
    },
    [triggerValidation]
  );

  // 운동 목록이 변경될 때 유효성 검사
  useEffect(() => {
    if (exerciseRecords.length > 0) {
      triggerValidation();
    }
  }, [exerciseRecords.length, triggerValidation]);

  // 드래그 앤 드롭 관련 핸들러
  const handleDragStart = useCallback(
    (index: number) => {
      setDraggedIndex(index);
      draggedItem.current = exerciseRecords[index];
    },
    [exerciseRecords]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 드롭을 허용하기 위해 필요
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      setExerciseRecords((prev) => {
        const newRecords = [...prev];
        const draggedRecord = newRecords.splice(draggedIndex, 1)[0];
        newRecords.splice(index, 0, draggedRecord);
        return newRecords;
      });

      setDraggedIndex(null);
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    draggedItem.current = null;
  }, []);

  // 운동 관련 핸들러
  const handleAddExercises = useCallback(
    (
      exercisesWithSets: {
        exercise: ExerciseDTO;
        sets: RecordDetailDTO[];
        setCount?: number;
      }[]
    ) => {
      const newRecords = exercisesWithSets.map(
        ({ exercise, sets, setCount }) => ({
          id: uuidv4(),
          exercise,
          sets,
          setCount,
        })
      );

      setExerciseRecords((prev) => [...prev, ...newRecords]);
      setShowExerciseSelector(false);
    },
    []
  );

  const handleRemoveExercise = useCallback((index: number) => {
    setExerciseRecords((prev) => {
      const newRecords = [...prev];
      newRecords.splice(index, 1);
      return newRecords;
    });
  }, []);

  // 사진 관련 핸들러
  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    []
  );

  const handleRemovePhoto = useCallback(() => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // API 관련 함수
  const loadRecentWorkouts = useCallback(async () => {
    setIsLoadingRecentWorkouts(true);
    try {
      const response = await getRecentWorkoutRecordsAPI();
      setRecentWorkouts(response);
      setShowRecentWorkoutsModal(true);
    } catch (error) {
      console.error("최근 운동 기록 로딩 실패:", error);
      alert("최근 운동 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRecentWorkouts(false);
    }
  }, []);

  const loadAndApplyWorkoutDetails = useCallback(async (workoutId: number) => {
    setIsLoadingDetails(true);
    try {
      const workoutDetails: WorkoutDetailResponseDTO =
        await getWorkoutRecordDetailsAPI(workoutId);

      // 운동 기록 데이터 구조화
      const exerciseMap = new Map<number, ExerciseRecordDTO>();

      workoutDetails.workoutDetails.forEach((detail: any) => {
        const exerciseSeq = detail.exercise.exerciseSeq;

        if (!exerciseMap.has(exerciseSeq)) {
          exerciseMap.set(exerciseSeq, {
            id: uuidv4(),
            exercise: {
              exerciseSeq: detail.exercise.exerciseSeq,
              exerciseName: detail.exercise.exerciseName,
              exerciseType: detail.exercise.exerciseType,
            },
            sets: [],
          });
        }

        exerciseMap.get(exerciseSeq)!.sets.push({
          weight: detail.weight,
          reps: detail.reps,
          distance: detail.distance,
          time: detail.recordTime,
        });
      });

      setExerciseRecords(Array.from(exerciseMap.values()));
      setShowRecentWorkoutsModal(false);
    } catch (error) {
      console.error("운동 상세 정보 로딩 실패:", error);
      alert("운동 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      alert("필수 입력 항목을 확인해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 워크아웃 데이터 구성
      const workoutData = {
        date: date.toISOString().split("T")[0],
        exerciseRecords: exerciseRecords.map((record) => ({
          exercise: {
            exerciseSeq: record.exercise.exerciseSeq,
            exerciseName: record.exercise.exerciseName,
            exerciseType: record.exercise.exerciseType,
          },
          sets: record.sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
            time: set.time,
            distance: set.distance,
          })),
        })),
        diary: diaryText || null,
      };

      // 장소 정보 구성
      const placeInfo = selectedLocation
        ? {
            kakaoPlaceId: selectedLocation.kakaoPlaceId || "",
            placeName: selectedLocation.placeName,
            addressName: selectedLocation.addressName || "",
            roadAddressName: selectedLocation.roadAddressName || "",
            x: selectedLocation.x?.toString() || "0",
            y: selectedLocation.y?.toString() || "0",
          }
        : undefined;

      // FormData 구성
      const formData = new FormData();
      formData.append("workoutData", JSON.stringify(workoutData));

      if (placeInfo) {
        formData.append("placeInfo", JSON.stringify(placeInfo));
      }

      if (selectedPhoto && selectedPhoto instanceof File) {
        formData.append("image", selectedPhoto);
      }

      // API 호출
      await saveWorkoutRecordAPI(formData);
      alert("운동 기록이 성공적으로 저장되었습니다!");
      navigate(`/profile/${userNickname}`);
    } catch (error) {
      console.error("운동 기록 저장 실패:", error);
      alert("운동 기록 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    date,
    exerciseRecords,
    diaryText,
    selectedLocation,
    selectedPhoto,
    userNickname,
    navigate,
  ]);

  if (!userInfo) return null;

  return (
    <Container>
      {/* 날짜 선택 */}
      <FormGroup>
        <Label>운동 날짜</Label>
        <CustomDatePickerWrapper>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
          />
        </CustomDatePickerWrapper>
      </FormGroup>

      {/* 장소 선택 */}
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
            <RemoveButton onClick={() => setSelectedLocation(null)}>
              삭제
            </RemoveButton>
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

      {/* 사진 업로드 */}
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

      {/* 운동 일기 */}
      <TextareaContainer>
        <Label>오늘의 운동 일기 (선택사항)</Label>
        <StyledTextarea
          placeholder="오늘 운동에 대한 생각이나 느낌을 기록해보세요."
          value={diaryText}
          onChange={handleDiaryChange}
        />
      </TextareaContainer>

      {/* 운동 목록 */}
      <ExercisesContainer>
        <ButtonContainer>
          <Label>운동 목록</Label>
          <SecondaryButton onClick={loadRecentWorkouts}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z" />
            </svg>
            최근 운동 목록 가져오기
          </SecondaryButton>
        </ButtonContainer>

        {isLoadingDetails && (
          <LoadingMessage>운동 상세 정보를 불러오는 중...</LoadingMessage>
        )}

        {exerciseRecords.map((record, index) => (
          <DraggableItem
            key={record.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            isDragging={index === draggedIndex}
          >
            <ExerciseSetFormMemo
              exercise={record.exercise}
              onRemove={() => handleRemoveExercise(index)}
              onChange={(sets) => handleSetsChange(index, sets)}
              setCount={record.setCount}
              initialSets={record.sets}
            />
          </DraggableItem>
        ))}

        <AddExerciseButton onClick={() => setShowExerciseSelector(true)}>
          + 운동 추가하기
        </AddExerciseButton>
      </ExercisesContainer>

      <SubmitButton
        disabled={isSubmitting || !isButtonEnabled}
        onClick={handleSubmit}
      >
        {isSubmitting ? "저장 중..." : "기록 저장하기"}
      </SubmitButton>

      {/* 운동 선택 모달 */}
      {showExerciseSelector && (
        <Modal>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>운동 선택</ModalTitle>
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
          <ModalContent onClick={(e) => e.stopPropagation()}>
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

      {/* 최근 운동 기록 모달 */}
      {showRecentWorkoutsModal && (
        <Modal>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>최근 운동 목록</ModalTitle>
              <CloseButton onClick={() => setShowRecentWorkoutsModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            {isLoadingRecentWorkouts ? (
              <LoadingMessage>최근 운동 기록을 불러오는 중...</LoadingMessage>
            ) : (
              <RecentWorkoutsList>
                {recentWorkouts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    최근 저장한 운동 기록이 없습니다.
                  </div>
                ) : (
                  recentWorkouts.map((workout) => (
                    <RecentWorkoutItem
                      key={workout.workoutOfTheDaySeq}
                      onClick={() =>
                        loadAndApplyWorkoutDetails(workout.workoutOfTheDaySeq)
                      }
                    >
                      <WorkoutDate>
                        {format(
                          new Date(workout.recordDate),
                          "yyyy년 MM월 dd일"
                        )}
                      </WorkoutDate>

                      {workout.workoutPlace && (
                        <WorkoutInfo>
                          <WorkoutIcon>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                            </svg>
                          </WorkoutIcon>
                          {workout.workoutPlace.placeName}
                        </WorkoutInfo>
                      )}

                      {workout.mainExerciseType && (
                        <WorkoutInfo>
                          <WorkoutIcon>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M1 11.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 0-1h-13a.5.5 0 0 0-.5.5ZM8 7.04a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM6 13c-2.76 0-5-1.5-5-3v-.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5V10c0 1.971-2.5 3-5 3Z" />
                            </svg>
                          </WorkoutIcon>
                          {workout.mainExerciseType}
                        </WorkoutInfo>
                      )}

                      {workout.workoutDetails &&
                        workout.workoutDetails.length > 0 && (
                          <WorkoutExercises>
                            {workout.workoutDetails
                              .filter(
                                (detail, index, self) =>
                                  index ===
                                  self.findIndex(
                                    (d) =>
                                      d.exercise.exerciseName ===
                                      detail.exercise.exerciseName
                                  )
                              )
                              .slice(0, 3)
                              .map((detail, index) => (
                                <ExerciseItem key={index}>
                                  {detail.exercise.exerciseName}
                                </ExerciseItem>
                              ))}
                            {workout.workoutDetails.length > 3 && (
                              <ExerciseItem>
                                외 {workout.workoutDetails.length - 3}개 운동
                              </ExerciseItem>
                            )}
                          </WorkoutExercises>
                        )}
                    </RecentWorkoutItem>
                  ))
                )}
              </RecentWorkoutsList>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default WorkoutRecordPage;
