import React from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";

const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  margin-bottom: 44px;
  gap: 30px;
`;

const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #dbdbdb;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 40px;
  margin: 20px 0;
`;

const StatItem = styled.div`
  text-align: center;

  .number {
    font-size: 1.2rem;
    font-weight: 600;
  }

  .label {
    color: #8e8e8e;
    font-size: 0.9rem;
  }
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
`;

const EditButton = styled.button`
  padding: 5px 9px;
  background: transparent;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #fafafa;
  }
`;

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 40px;
`;

const WorkoutCard = styled.div`
  aspect-ratio: 1;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const WorkoutContent = styled.div`
  padding: 12px;

  h3 {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  p {
    font-size: 0.8rem;
    color: #8e8e8e;
  }
`;

const WorkoutOfTheDay: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);

  return (
    <div>
      <WorkoutGrid>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <WorkoutCard key={item}>
            <WorkoutContent>
              <h3>상체 운동 Day {item}</h3>
              <p>벤치프레스 12x3</p>
              <p>덤벨컬 15x3</p>
              <p>2024.03.21</p>
            </WorkoutContent>
          </WorkoutCard>
        ))}
      </WorkoutGrid>
    </div>
  );
};

export default WorkoutOfTheDay;
