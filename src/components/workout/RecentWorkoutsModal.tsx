import React from "react";
import { format } from "date-fns";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Message,
  RecentWorkoutsList,
  RecentWorkoutItem,
  WorkoutDate,
  WorkoutInfo,
  WorkoutIcon,
  WorkoutExercises,
  ExerciseTag,
} from "../../styles/WorkoutRecordStyles";
import { WorkoutOfTheDayDTO } from "../../dtos/WorkoutDTO";

interface RecentWorkoutsModalProps {
  recentWorkouts: WorkoutOfTheDayDTO[];
  isLoading: boolean;
  onSelectWorkout: (workoutId: number) => void;
  onClose: () => void;
}

const RecentWorkoutsModal: React.FC<RecentWorkoutsModalProps> = ({
  recentWorkouts,
  isLoading,
  onSelectWorkout,
  onClose,
}) => {
  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>최근 운동 목록</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <Message>최근 운동 기록을 불러오는 중...</Message>
          ) : (
            <RecentWorkoutsList>
              {recentWorkouts.length === 0 ? (
                <Message>최근 저장한 운동 기록이 없습니다.</Message>
              ) : (
                recentWorkouts.map((workout) => (
                  <RecentWorkoutItem
                    key={workout.workoutOfTheDaySeq}
                    onClick={() => onSelectWorkout(workout.workoutOfTheDaySeq)}
                  >
                    <WorkoutDate>
                      {format(new Date(workout.recordDate), "yyyy년 MM월 dd일")}
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
  );
};

export default RecentWorkoutsModal;
