import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import WorkoutDetailModal from "../components/WorkoutDetailModal";
import {
  FiActivity,
  FiCamera,
  FiBarChart2,
  FiUsers,
  FiArrowRight,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { theme, fadeIn, slideIn, media } from "../styles/theme";

// 메인 컨테이너
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px 60px;
`;

// 히어로 섹션
const Hero = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #4a90e2 0%, #6c5ce7 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 50px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.08)' fill-rule='evenodd'/%3E%3C/svg%3E")
      repeat;
    opacity: 0.3;
  }

  h1 {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 1.2rem;
    position: relative;

    ${media.sm} {
      font-size: 2.2rem;
    }
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    position: relative;

    ${media.sm} {
      font-size: 1rem;
    }
  }
`;

// 주요 버튼 스타일
const Button = styled.button`
  padding: 0.9rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  background-color: white;
  color: #4a90e2;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  ${media.sm} {
    padding: 0.8rem 1.8rem;
    font-size: 1rem;
  }
`;

// 기능 카드 그리드
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;

  ${media.sm} {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

// 기능 카드
const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

// 카드 이미지 영역
const CardImage = styled.div<{ bgColor: string }>`
  height: 160px;
  background: ${(props) => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E")
      repeat;
    opacity: 0.4;
  }
`;

// 카드 콘텐츠 영역
const CardContent = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;

  h3 {
    color: #333;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    flex: 1;
  }
`;

// 로그인 필요 뱃지
const LoginRequiredBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #f8f9fa;
  color: #6c757d;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  gap: 6px;
  margin-top: auto;

  svg {
    font-size: 0.9rem;
  }
`;

// CTA 섹션
const CTASection = styled.div`
  text-align: center;
  padding: 50px 30px;
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
  border-radius: 16px;
  margin-top: 40px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  animation: ${fadeIn} 0.8s ease-out;

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }

  ${media.sm} {
    padding: 30px 20px;

    h2 {
      font-size: 1.5rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

// 통계 섹션
const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
  flex-wrap: wrap;

  ${media.sm} {
    gap: 20px;
  }
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-size: 2.2rem;
    font-weight: 700;
    color: #4a90e2;
    margin-bottom: 5px;

    ${media.sm} {
      font-size: 1.8rem;
    }
  }

  .label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state: any) => state.auth.token);
  const [selectedWorkoutSeq, setSelectedWorkoutSeq] = useState<number | null>(
    null
  );
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const workoutId = searchParams.get("workout");
    const commentId = searchParams.get("comment");

    if (workoutId) {
      setSelectedWorkoutSeq(parseInt(workoutId, 10));

      if (commentId) {
        setSelectedCommentId(parseInt(commentId, 10));
      }

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("workout");
      newSearchParams.delete("comment");
      if (newSearchParams.toString()) {
        navigate({ search: newSearchParams.toString() }, { replace: true });
      } else {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);

  const handleCloseModal = () => {
    setSelectedWorkoutSeq(null);
    setSelectedCommentId(null);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/workout");
    } else {
      navigate("/login");
    }
  };

  const handleFeatureClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  // 기능 카드 데이터
  const features = [
    {
      icon: <FiUsers />,
      title: "피드",
      description:
        "다른 사용자들의 운동 기록을 확인하고 소통할 수 있습니다. 좋아요와 댓글로 서로에게 동기부여를 주고 받으세요.",
      color: "linear-gradient(135deg, #4a90e2 0%, #5ca9fb 100%)",
      path: "/feed",
    },
    {
      icon: <FiCamera />,
      title: "오운완",
      description:
        "오늘의 운동 완료! 운동 사진과 함께 당신의 성취를 기록하고 공유하세요. 지속적인 기록으로 변화를 확인하세요.",
      color: "linear-gradient(135deg, #50c9c3 0%, #96deda 100%)",
      path: "/feed",
    },
    {
      icon: <FiBarChart2 />,
      title: "바디로그",
      description:
        "체중, 체지방률, 골격근량 등 신체 변화를 추적하세요. 그래프로 시각화된 변화 추이를 한눈에 확인할 수 있습니다.",
      color: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
      path: "/body-log",
    },
    {
      icon: <FiActivity />,
      title: "운동 기록",
      description:
        "세트별 무게, 횟수를 상세히 기록할 수 있습니다. 이전 기록을 바탕으로 운동 강도를 쉽게 계획하고 진행 상황을 추적하세요.",
      color: "linear-gradient(135deg, #e17055 0%, #fab1a0 100%)",
      path: "/workout",
    },
    {
      icon: <FiCalendar />,
      title: "운동 통계",
      description:
        "일별, 월별 운동 통계를 확인하세요. 운동 빈도, 운동 유형별 통계, 운동 시간 등 다양한 지표로 당신의 운동 패턴을 분석합니다.",
      color: "linear-gradient(135deg, #ff7675 0%, #ffa8a8 100%)",
      path: "/statistics",
    },
    {
      icon: <FiMapPin />,
      title: "운동 장소",
      description:
        "다양한 운동 장소를 찾고 확인하세요. 다른 유저들이 방문한 체육관, 러닝 코스, 운동 시설 정보를 공유받을 수 있습니다.",
      color: "linear-gradient(135deg, #fdcb6e 0%, #ffeaa7 100%)",
      path: "/feed",
    },
  ];

  return (
    <Container>
      <Hero>
        <h1>당신의 운동 여정, 지금 시작하세요</h1>
        <p>
          매일의 운동 기록부터 신체 변화 트래킹, 커뮤니티 활동까지.
          <br />더 건강한 라이프스타일을 위한 모든 것이 여기에 있습니다.
        </p>
        <Button onClick={handleGetStarted}>
          {isAuthenticated ? "운동 기록하기" : "무료로 시작하기"}
          <FiArrowRight />
        </Button>
      </Hero>

      <StatsSection>
        <StatItem>
          <div className="value">10,000+</div>
          <div className="label">활성 사용자</div>
        </StatItem>
        <StatItem>
          <div className="value">50만+</div>
          <div className="label">기록된 운동</div>
        </StatItem>
        <StatItem>
          <div className="value">4.9</div>
          <div className="label">평균 평점</div>
        </StatItem>
      </StatsSection>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            onClick={() => handleFeatureClick(feature.path)}
            style={{ cursor: "pointer" }}
          >
            <CardImage bgColor={feature.color}>{feature.icon}</CardImage>
            <CardContent>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {!isAuthenticated && (
                <LoginRequiredBadge>
                  <FiUsers size={14} /> 로그인 후 이용 가능
                </LoginRequiredBadge>
              )}
            </CardContent>
          </FeatureCard>
        ))}
      </FeaturesGrid>

      <CTASection>
        <h2>지금 바로 시작하세요</h2>
        <p>회원가입 후 모든 기능을 무료로 이용할 수 있습니다.</p>
        <Button
          onClick={handleGetStarted}
          style={{ background: "#4a90e2", color: "white" }}
        >
          {isAuthenticated ? "내 피드로 가기" : "시작하기"}
          <FiArrowRight />
        </Button>
      </CTASection>

      {selectedWorkoutSeq && (
        <WorkoutDetailModal
          workoutOfTheDaySeq={selectedWorkoutSeq}
          commentId={selectedCommentId || undefined}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default HomePage;
