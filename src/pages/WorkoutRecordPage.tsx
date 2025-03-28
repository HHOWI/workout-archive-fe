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

// 색상 테마 상수화
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

// 간격 및 크기 상수화
const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

const BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  round: "50%",
};

// 전체 레이아웃 관련 반응형 스타일 적용
const minimumFormsWidth = "680px";

// 메인 컨테이너
const Container = styled.div`
  max-width: 1000px;
  width: 95%;
  margin: 0 auto;
  padding: ${SPACING.lg} ${SPACING.md};
  color: ${COLORS.text};
`;

// 카드 스타일 컴포넌트
const Card = styled.div`
  background-color: ${COLORS.cardBackground};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px ${COLORS.shadowLight};
  margin-bottom: ${SPACING.lg};
  overflow: hidden;
`;

// 카드 헤더
const CardHeader = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${SPACING.sm};

  @media (max-width: ${minimumFormsWidth}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// 카드 내용
const CardBody = styled.div`
  padding: ${SPACING.lg};
`;

// 카드 제목
const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${COLORS.text};
`;

// 카드 푸터
const CardFooter = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-top: 1px solid ${COLORS.border};
  background-color: ${COLORS.secondary};
`;

// 폼 레이블
const Label = styled.label`
  display: block;
  margin-bottom: ${SPACING.sm};
  font-weight: 600;
  font-size: 15px;
  color: ${COLORS.text};
`;

// 날짜, 장소 선택 그리드 레이아웃
const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 8.5fr;
  gap: ${SPACING.xl};

  @media (max-width: ${minimumFormsWidth}) {
    grid-template-columns: 1fr;
    gap: ${SPACING.md};
  }
`;

// 입력 필드 공통 스타일
const inputBaseStyles = `
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: ${COLORS.text};
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
  }
  
  &:hover {
    border-color: ${COLORS.borderDark};
  }
`;

// 날짜 선택기 래퍼
const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    display: block;
    width: 100%;
  }

  .react-datepicker__input-container input {
    ${inputBaseStyles}
  }
`;

// 위치 선택 버튼
const LocationButton = styled.button`
  ${inputBaseStyles}
  display: flex;
  align-items: center;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  text-align: left;

  svg {
    margin-right: ${SPACING.sm};
    color: ${COLORS.primary};
    flex-shrink: 0;
  }

  &:hover,
  &:focus {
    border-color: ${COLORS.borderDark};
    background-color: ${COLORS.secondaryHover};
  }
`;

// 선택된 위치 표시
const SelectedLocation = styled.div`
  ${inputBaseStyles}
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: auto;
  min-height: 40px;
  padding: 4px 12px;

  &:hover {
    border-color: ${COLORS.borderDark};
  }
`;

// 선택된 위치 표시 스타일 개선
const LocationInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

// 위치 이름
const LocationName = styled.div`
  font-weight: 600;
  color: ${COLORS.text};
  white-space: nowrap;
`;

// 위치 주소
const LocationAddress = styled.div`
  font-size: 13px;
  color: ${COLORS.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 삭제 버튼
const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  color: ${COLORS.danger};
  border: none;
  cursor: pointer;
  padding: ${SPACING.xs};
  margin-left: ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.sm};
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

// 사진 및 일기 그리드
const PhotoDiaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background-color: ${COLORS.cardBackground};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px ${COLORS.shadowLight};
  overflow: hidden;
  margin-bottom: ${SPACING.lg};

  @media (max-width: ${minimumFormsWidth}) {
    grid-template-columns: 1fr;
  }
`;

// 사진 섹션
const PhotoSection = styled.div`
  padding: ${SPACING.lg};
  border-right: 1px solid ${COLORS.border};

  @media (max-width: ${minimumFormsWidth}) {
    border-right: none;
    border-bottom: 1px solid ${COLORS.border};
  }
`;

// 일기 섹션
const DiarySection = styled.div`
  padding: ${SPACING.lg};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

// 사진 업로드 컨테이너
const PhotoUploadContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// 사진 미리보기 영역
const PhotoPreviewArea = styled.div<{ hasPhoto: boolean }>`
  flex: 1;
  min-height: 280px;
  border: ${(props) =>
    props.hasPhoto ? "none" : `2px dashed ${COLORS.border}`};
  border-radius: ${BORDER_RADIUS.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md};
  overflow: hidden;
  position: relative;
  cursor: ${(props) => (props.hasPhoto ? "default" : "pointer")};
  background-color: ${(props) =>
    props.hasPhoto ? "transparent" : COLORS.secondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.hasPhoto ? "transparent" : COLORS.secondaryHover};
    border-color: ${(props) => (props.hasPhoto ? "none" : COLORS.borderDark)};
  }
`;

// 사진 미리보기
const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

// 업로드 플레이스홀더
const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${SPACING.md};
  color: ${COLORS.textSecondary};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${SPACING.md};
    color: ${COLORS.textLight};
  }

  p {
    margin: 0;
    font-size: 15px;
  }
`;

// 파일 입력
const FileInput = styled.input`
  display: none;
`;

// 사진 제거 버튼
const PhotoRemoveButton = styled.button`
  background-color: ${COLORS.background};
  color: ${COLORS.danger};
  border: 1px solid ${COLORS.danger};
  border-radius: ${BORDER_RADIUS.md};
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

// 운동 일기 텍스트 영역
const DiaryTextarea = styled.textarea`
  width: 100%;
  min-height: 280px;
  padding: 12px 16px;
  font-size: 15px;
  font-family: inherit;
  color: ${COLORS.text};
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  resize: vertical;
  line-height: 1.6;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
  }

  &:hover:not(:focus) {
    border-color: ${COLORS.borderDark};
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

// 운동 목록 헤더
const ExerciseListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};
`;

// 최근 운동 버튼
const RecentWorkoutsButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  padding: 10px 16px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: ${minimumFormsWidth}) {
    width: 100%;
    justify-content: center;
    margin-top: ${SPACING.xs};
  }

  svg {
    color: ${COLORS.primary};
  }

  &:hover {
    background-color: ${COLORS.secondaryHover};
    border-color: ${COLORS.borderDark};
  }
`;

// 운동 추가 버튼
const AddExerciseButton = styled.button`
  width: 100%;
  padding: ${SPACING.md};
  margin-top: ${SPACING.md};
  background-color: ${COLORS.secondary};
  color: ${COLORS.textSecondary};
  border: 1px dashed ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLORS.secondaryHover};
    border-color: ${COLORS.borderDark};
    color: ${COLORS.text};
  }
`;

// 드래그 가능한 운동 아이템
const DraggableExercise = styled.div<{ isDragging?: boolean }>`
  margin-bottom: ${SPACING.md};
  opacity: ${(props) => (props.isDragging ? "0.5" : "1")};
  cursor: grab;
  border-radius: ${BORDER_RADIUS.md};
  overflow: hidden;
  box-shadow: 0 2px 6px ${COLORS.shadowLight};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${COLORS.shadow};
  }

  &:active {
    cursor: grabbing;
  }
`;

// 메시지 스타일
const Message = styled.div`
  text-align: center;
  padding: ${SPACING.lg} ${SPACING.md};
  color: ${COLORS.textSecondary};
  font-size: 15px;
`;

// 저장 버튼
const SaveButton = styled.button`
  width: 100%;
  padding: ${SPACING.md};
  background-color: ${COLORS.primary};
  color: white;
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    background-color: ${COLORS.primaryHover};
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }

  &:disabled {
    background-color: ${COLORS.textLight};
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${SPACING.md};
`;

const ModalContent = styled.div`
  background-color: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

  @media (max-width: ${minimumFormsWidth}) {
    width: 100%;
    max-height: 90vh;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${COLORS.secondary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c9d6;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8b2c1;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  position: sticky;
  top: 0;
  background-color: ${COLORS.background};
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${COLORS.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: ${SPACING.lg};
`;

// 최근 운동 목록 스타일
const RecentWorkoutsList = styled.div`
  margin-top: ${SPACING.md};
`;

const RecentWorkoutItem = styled.div`
  padding: ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  margin-bottom: ${SPACING.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLORS.secondary};
    border-color: ${COLORS.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${COLORS.shadowLight};
  }
`;

const WorkoutDate = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${COLORS.text};
  margin-bottom: ${SPACING.sm};
`;

const WorkoutInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
  margin-bottom: ${SPACING.sm};
  font-size: 14px;
  color: ${COLORS.textSecondary};
`;

const WorkoutIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${COLORS.primary};
`;

const WorkoutExercises = styled.div`
  margin-top: ${SPACING.sm};
  padding-top: ${SPACING.sm};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.xs};
`;

const ExerciseTag = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.text};
  padding: 4px 10px;
  border-radius: 12px;
  margin: 2px;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${COLORS.primary};
    margin-right: 6px;
  }
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

  // 커스텀 스타일을 head에 추가
  useEffect(() => {
    // DatePicker 스타일 커스터마이징
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .custom-datepicker {
        font-family: inherit !important;
        font-size: 14px !important;
        color: ${COLORS.text} !important;
        height: 40px !important;
      }
      
      .react-datepicker {
        font-family: inherit !important;
        border-color: ${COLORS.border} !important;
        box-shadow: 0 2px 10px ${COLORS.shadowLight} !important;
        font-size: 13px !important;
      }
      
      .react-datepicker__header {
        background-color: ${COLORS.secondary} !important;
        border-bottom-color: ${COLORS.border} !important;
        padding-top: 8px !important;
      }
      
      .react-datepicker__current-month, 
      .react-datepicker-time__header,
      .react-datepicker-year-header {
        color: ${COLORS.text} !important;
        font-weight: 600 !important;
        font-size: 14px !important;
      }
      
      .react-datepicker__day {
        margin: 2px !important;
      }
      
      .react-datepicker__day--selected, 
      .react-datepicker__day--keyboard-selected {
        background-color: ${COLORS.primary} !important;
        color: white !important;
      }
      
      .react-datepicker__day:hover {
        background-color: ${COLORS.primaryLight} !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  const handlePhotoContainerClick = useCallback(() => {
    if (!photoPreview) {
      fileInputRef.current?.click();
    }
  }, [photoPreview]);

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
      {/* 날짜 및 장소 섹션 */}
      <Card>
        <CardBody>
          <TwoColumnGrid>
            <div>
              <Label>운동 날짜</Label>
              <DatePickerWrapper>
                <DatePicker
                  selected={date}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="custom-datepicker"
                />
              </DatePickerWrapper>
            </div>

            <div>
              <Label>운동 장소 (선택사항)</Label>
              {selectedLocation ? (
                <SelectedLocation>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </RemoveButton>
                </SelectedLocation>
              ) : (
                <LocationButton onClick={() => setShowLocationModal(true)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  장소 선택하기
                </LocationButton>
              )}
            </div>
          </TwoColumnGrid>
        </CardBody>
      </Card>

      {/* 사진과 일기 섹션 */}
      <PhotoDiaryGrid>
        <PhotoSection>
          <PhotoUploadContainer>
            <Label>운동 사진 (선택사항)</Label>
            <PhotoPreviewArea
              hasPhoto={!!photoPreview}
              onClick={photoPreview ? undefined : handlePhotoContainerClick}
            >
              {photoPreview ? (
                <PreviewImage src={photoPreview} alt="운동 사진 미리보기" />
              ) : (
                <UploadPlaceholder>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p>사진을 업로드하려면 클릭하세요</p>
                </UploadPlaceholder>
              )}
            </PhotoPreviewArea>

            <FileInput
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              ref={fileInputRef}
            />

            {photoPreview && (
              <PhotoRemoveButton onClick={handleRemovePhoto}>
                사진 제거
              </PhotoRemoveButton>
            )}
          </PhotoUploadContainer>
        </PhotoSection>

        <DiarySection>
          <Label>오늘의 운동 일기 (선택사항)</Label>
          <DiaryTextarea
            placeholder="오늘 운동에 대한 생각이나 느낌을 기록해보세요."
            value={diaryText}
            onChange={handleDiaryChange}
            spellCheck="false"
          />
        </DiarySection>
      </PhotoDiaryGrid>

      {/* 운동 목록 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>운동 목록</CardTitle>
          <RecentWorkoutsButton onClick={loadRecentWorkouts}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            최근 운동 목록 가져오기
          </RecentWorkoutsButton>
        </CardHeader>

        <CardBody>
          {isLoadingDetails && (
            <Message>운동 상세 정보를 불러오는 중...</Message>
          )}

          {exerciseRecords.map((record, index) => (
            <DraggableExercise
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
            </DraggableExercise>
          ))}

          {exerciseRecords.length === 0 && (
            <Message>아직 추가된 운동이 없습니다. 운동을 추가해보세요.</Message>
          )}

          <AddExerciseButton onClick={() => setShowExerciseSelector(true)}>
            + 운동 추가하기
          </AddExerciseButton>
        </CardBody>
      </Card>

      {/* 저장 버튼 */}
      <SaveButton
        disabled={isSubmitting || !isButtonEnabled}
        onClick={handleSubmit}
      >
        {isSubmitting ? "저장 중..." : "기록 저장하기"}
      </SaveButton>

      {/* 운동 선택 모달 */}
      {showExerciseSelector && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>운동 선택</ModalTitle>
              <CloseButton onClick={() => setShowExerciseSelector(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <ExerciseSelector
                onSelectExercises={handleAddExercises}
                onCancel={() => setShowExerciseSelector(false)}
              />
            </ModalBody>
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
            <ModalBody>
              <KakaoMapPlaceSelector onPlaceSelect={handleLocationSelect} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 최근 운동 기록 모달 */}
      {showRecentWorkoutsModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>최근 운동 목록</ModalTitle>
              <CloseButton onClick={() => setShowRecentWorkoutsModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {isLoadingRecentWorkouts ? (
                <Message>최근 운동 기록을 불러오는 중...</Message>
              ) : (
                <RecentWorkoutsList>
                  {recentWorkouts.length === 0 ? (
                    <Message>최근 저장한 운동 기록이 없습니다.</Message>
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
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                                <circle cx="12" cy="10" r="3" />
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
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                                <line x1="16" y1="8" x2="2" y2="22" />
                                <line x1="17.5" y1="15" x2="9" y2="15" />
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
                                .map((detail, index) => (
                                  <ExerciseTag key={index}>
                                    {detail.exercise.exerciseName}
                                  </ExerciseTag>
                                ))}
                            </WorkoutExercises>
                          )}
                      </RecentWorkoutItem>
                    ))
                  )}
                </RecentWorkoutsList>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default WorkoutRecordPage;
