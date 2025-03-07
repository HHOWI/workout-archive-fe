import React from "react";
import styled from "@emotion/styled";

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
