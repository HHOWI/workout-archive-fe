import { useState, useRef, useCallback, useEffect } from "react";
import {
  ExerciseRecordDTO,
  RecordDetailDTO,
  WorkoutPlaceDTO,
} from "../dtos/WorkoutDTO";
import { SaveWorkoutSchema } from "../schema/WorkoutSchema";

export const useWorkoutForm = () => {
  // 기본 상태
  const [date, setDate] = useState<Date>(new Date());
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordDTO[]>(
    []
  );
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 위치 관련 상태
  const [selectedLocation, setSelectedLocation] =
    useState<WorkoutPlaceDTO | null>(null);

  // 사진 및 일기 상태
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState<string>("");

  // 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggedItem = useRef<ExerciseRecordDTO | null>(null);

  // 폼 유효성 검사
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

  // 운동 기록 데이터 변경 관련 핸들러
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

  const handleRemoveExercise = useCallback((index: number) => {
    setExerciseRecords((prev) => {
      const newRecords = [...prev];
      newRecords.splice(index, 1);
      return newRecords;
    });
  }, []);

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
      triggerValidation();
    },
    [triggerValidation]
  );

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

  // 운동 목록이 변경될 때 유효성 검사
  useEffect(() => {
    if (exerciseRecords.length > 0) {
      triggerValidation();
    }
  }, [exerciseRecords.length, triggerValidation]);

  // DatePicker 스타일 커스터마이징
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .custom-datepicker {
        font-family: inherit !important;
        font-size: 14px !important;
        color: #333333 !important;
        height: 40px !important;
      }
      
      .react-datepicker {
        font-family: inherit !important;
        border-color: #dde2e8 !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
        font-size: 13px !important;
      }
      
      .react-datepicker__header {
        background-color: #f8f9fa !important;
        border-bottom-color: #dde2e8 !important;
        padding-top: 8px !important;
      }
      
      .react-datepicker__current-month, 
      .react-datepicker-time__header,
      .react-datepicker-year-header {
        color: #333333 !important;
        font-weight: 600 !important;
        font-size: 14px !important;
      }
      
      .react-datepicker__day {
        margin: 2px !important;
      }
      
      .react-datepicker__day--selected, 
      .react-datepicker__day--keyboard-selected {
        background-color: #4a90e2 !important;
        color: white !important;
      }
      
      .react-datepicker__day:hover {
        background-color: #e8f2ff !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return {
    // 상태
    date,
    setDate,
    exerciseRecords,
    setExerciseRecords,
    selectedLocation,
    setSelectedLocation,
    selectedPhoto,
    setSelectedPhoto,
    photoPreview,
    setPhotoPreview,
    diaryText,
    setDiaryText,
    isButtonEnabled,
    isSubmitting,
    setIsSubmitting,
    fileInputRef,
    draggedItem,

    // 메서드
    validateForm,
    triggerValidation,
    handleSetsChange,
    handleDateChange,
    handleDiaryChange,
    handleRemoveExercise,
    handleLocationSelect,
    handlePhotoSelect,
    handleRemovePhoto,
    handlePhotoContainerClick,
  };
};
