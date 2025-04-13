import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container } from "../styles/WorkoutRecordStyles";
import DateExerciseSection from "../components/workout/DateExerciseSection";
import PhotoDiarySection from "../components/workout/PhotoDiarySection";
import ExerciseListSection from "../components/workout/ExerciseListSection";
import SaveButtonSection from "../components/workout/SaveButtonSection";
import ExerciseSelectorModal from "../components/workout/ExerciseSelectorModal";
import LocationSelectorModal from "../components/workout/LocationSelectorModal";
import RecentWorkoutsModal from "../components/workout/RecentWorkoutsModal";
import { useWorkoutForm } from "../hooks/useWorkoutForm";
import {
  saveWorkoutRecordAPI,
  getRecentWorkoutRecordsAPI,
  getWorkoutRecordDetailsAPI,
} from "../api/workout";
import { v4 as uuidv4 } from "uuid";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { ExerciseWithSets } from "../components/workout/ExerciseSelectorModal";

const WorkoutRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const userNickname = useSelector(
    (state: any) => state.auth.userInfo?.userNickname
  );

  // 모달 상태 관리
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRecentWorkoutsModal, setShowRecentWorkoutsModal] = useState(false);

  // 운동 기록 폼 데이터 및 상태 관리
  const {
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
    validateForm,
    handleDiaryChange,
    handleSetsChange,
    handleDateChange,
    handleRemoveExercise,
    handleLocationSelect,
  } = useWorkoutForm();

  // 드래그 앤 드롭 관련 상태
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // API 관련 상태
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutOfTheDayDTO[]>(
    []
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingRecentWorkouts, setIsLoadingRecentWorkouts] = useState(false);

  // 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // 운동 추가 핸들러
  const handleAddExercises = useCallback(
    (exercisesWithSets: ExerciseWithSets[]) => {
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
    [setExerciseRecords]
  );

  // 드래그 앤 드롭 관련 핸들러
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
    [draggedIndex, setExerciseRecords]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // 모달 토글 핸들러
  const toggleExerciseSelector = useCallback(() => {
    setShowExerciseSelector((prev) => !prev);
  }, []);

  const toggleLocationModal = useCallback(() => {
    setShowLocationModal((prev) => !prev);
  }, []);

  const handleLocationRemove = useCallback(() => {
    setSelectedLocation(null);
  }, [setSelectedLocation]);

  // 최근 운동 기록 불러오기
  const loadRecentWorkouts = useCallback(async () => {
    setIsLoadingRecentWorkouts(true);
    try {
      const response = await getRecentWorkoutRecordsAPI();
      setRecentWorkouts(response);
      setShowRecentWorkoutsModal(true);
    } catch (error) {
      alert("최근 운동 기록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoadingRecentWorkouts(false);
    }
  }, []);

  // 특정 운동 상세 정보 불러오기
  const loadAndApplyWorkoutDetails = useCallback(
    async (workoutId: number) => {
      setIsLoadingDetails(true);
      try {
        const workoutDetails = await getWorkoutRecordDetailsAPI(workoutId);
        const exerciseMap = new Map();

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

          exerciseMap.get(exerciseSeq).sets.push({
            weight: detail.weight,
            reps: detail.reps,
            distance: detail.distance,
            time: detail.recordTime,
          });
        });

        setExerciseRecords(Array.from(exerciseMap.values()));
        setShowRecentWorkoutsModal(false);
      } catch (error) {
        alert("운동 상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [setExerciseRecords]
  );

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
    setIsSubmitting,
    navigate,
    userNickname,
  ]);

  const closeRecentWorkoutsModal = useCallback(() => {
    setShowRecentWorkoutsModal(false);
  }, []);

  if (!userInfo) return null;

  return (
    <Container>
      {/* 날짜 및 장소 섹션 */}
      <DateExerciseSection
        date={date}
        onDateChange={handleDateChange}
        selectedLocation={selectedLocation}
        onLocationRemove={handleLocationRemove}
        onOpenLocationModal={toggleLocationModal}
      />

      {/* 사진과 일기 섹션 */}
      <PhotoDiarySection
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
        diaryText={diaryText}
        onDiaryChange={handleDiaryChange}
      />

      {/* 운동 목록 섹션 */}
      <ExerciseListSection
        exerciseRecords={exerciseRecords}
        onRemoveExercise={handleRemoveExercise}
        onSetsChange={handleSetsChange}
        onAddExercise={toggleExerciseSelector}
        onLoadRecentWorkouts={loadRecentWorkouts}
        isLoadingDetails={isLoadingDetails}
        draggedIndex={draggedIndex}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      />

      {/* 저장 버튼 */}
      <SaveButtonSection
        isSubmitting={isSubmitting}
        isButtonEnabled={isButtonEnabled}
        onSubmit={handleSubmit}
      />

      {/* 모달 컴포넌트들 */}
      {showExerciseSelector && (
        <ExerciseSelectorModal
          onSelectExercises={handleAddExercises}
          onClose={toggleExerciseSelector}
        />
      )}

      {showLocationModal && (
        <LocationSelectorModal
          onPlaceSelect={handleLocationSelect}
          onClose={toggleLocationModal}
        />
      )}

      {showRecentWorkoutsModal && (
        <RecentWorkoutsModal
          recentWorkouts={recentWorkouts}
          isLoading={isLoadingRecentWorkouts}
          onSelectWorkout={loadAndApplyWorkoutDetails}
          onClose={closeRecentWorkoutsModal}
        />
      )}
    </Container>
  );
};

export default WorkoutRecordPage;
