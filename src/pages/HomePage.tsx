import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(to right, #4a90e2, #50c9c3);
  color: white;
  border-radius: 10px;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 5px;
  background-color: white;
  color: #4a90e2;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;

  h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: any) => state.auth.token);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/workout");
    } else {
      navigate("/login");
    }
  };

  const handleBodyLogClick = () => {
    if (isAuthenticated) {
      navigate("/body-log");
    } else {
      navigate("/login");
    }
  };

  return (
    <Container>
      <Hero>
        <h1>운동 기록의 시작</h1>
        <p>
          당신의 운동 여정을 더 스마트하게 관리하세요.
          <br />
          일일 운동 기록부터 장기 목표 달성까지, 모든 것을 한 곳에서.
        </p>
        <Button onClick={handleGetStarted}>
          {isAuthenticated ? "운동 기록하기" : "시작하기"}
        </Button>
      </Hero>

      <FeaturesGrid>
        <FeatureCard>
          <h3>운동 기록</h3>
          <p>
            일일 운동 기록을 간편하게 관리하고
            <br />
            진행 상황을 한눈에 확인하세요.
          </p>
        </FeatureCard>

        <FeatureCard>
          <h3>운동 통계</h3>
          <p>
            상세한 통계와 그래프로
            <br />
            당신의 성장을 확인하세요.
          </p>
        </FeatureCard>

        <FeatureCard>
          <h3>바디 로그</h3>
          <p>
            키, 체중, 골격근량, 체지방률 등을
            <br />
            기록하고 변화를 추적하세요.
          </p>
          <Button onClick={handleBodyLogClick} style={{ marginTop: "1rem" }}>
            {isAuthenticated ? "바디 로그 기록하기" : "시작하기"}
          </Button>
        </FeatureCard>

        <FeatureCard>
          <h3>커뮤니티</h3>
          <p>
            다른 사용자들과 운동 경험을
            <br />
            공유하고 동기부여를 받으세요.
          </p>
        </FeatureCard>
      </FeaturesGrid>
    </Container>
  );
};

export default HomePage;
