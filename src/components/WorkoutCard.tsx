import React from "react";
import styled from "@emotion/styled";
import { WorkoutOfTheDayDTO } from "../dtos/WorkoutDTO";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getImageUrl } from "../utils/imageUtils";
import { FiHeart, FiMessageSquare, FiCalendar, FiMapPin } from "react-icons/fi";

// 스타일 컴포넌트
const Card = styled.div`
  aspect-ratio: 1/1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background-color: #f0f0f0;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

    .hover-stats {
      opacity: 1;
      transform: translateY(0);
    }

    .workout-overlay {
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
      height: 50%;
    }

    .workout-image {
      transform: scale(1.05);
    }
  }
`;

const WorkoutImage = styled.div<{ url?: string }>`
  width: 100%;
  height: 100%;
  background-image: ${(props) => (props.url ? `url(${props.url})` : "none")};
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
`;

const NoImageContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222;
`;

const WorkoutCardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  padding: 12px 16px;
  color: white;
  width: 100%;
  height: 40%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: all 0.3s ease;
`;

const MetaInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  svg {
    margin-right: 4px;
    font-size: 0.8rem;
  }
`;

const HoverStats = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50px;
  padding: 6px 12px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 2;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  color: white;
  margin: 0 6px;
  font-size: 0.8rem;
  font-weight: 500;

  svg {
    margin-right: 4px;
  }
`;

interface WorkoutCardProps {
  workout: WorkoutOfTheDayDTO;
  onClick: (workoutOfTheDaySeq: number) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick }) => {
  const { workoutOfTheDaySeq, workoutPhoto, recordDate, workoutPlace } =
    workout;

  // WorkoutOfTheDayDTO에 해당 속성이 없을 수 있으므로 기본값 처리
  const likeCount = workout.workoutLikeCount ?? 0;
  const commentCount = workout.commentCount ?? 0;

  const formattedDate = format(new Date(recordDate), "yyyy년 MM월 dd일", {
    locale: ko,
  });
  const imageUrl = getImageUrl(workoutPhoto || null, "workout");

  return (
    <Card onClick={() => onClick(workoutOfTheDaySeq)}>
      {imageUrl ? (
        <WorkoutImage url={imageUrl} className="workout-image" />
      ) : (
        <NoImageContainer />
      )}

      <HoverStats className="hover-stats">
        <StatItem>
          <FiHeart /> {likeCount}
        </StatItem>
        <StatItem>
          <FiMessageSquare /> {commentCount}
        </StatItem>
      </HoverStats>

      <WorkoutCardOverlay className="workout-overlay">
        <MetaInfoContainer>
          <MetaInfo>
            <FiCalendar /> {formattedDate}
          </MetaInfo>
          {workoutPlace?.placeName && (
            <MetaInfo>
              <FiMapPin /> {workoutPlace.placeName}
            </MetaInfo>
          )}
        </MetaInfoContainer>
      </WorkoutCardOverlay>
    </Card>
  );
};

export default WorkoutCard;
