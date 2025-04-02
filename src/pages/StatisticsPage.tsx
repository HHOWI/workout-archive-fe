import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import {
  Tabs,
  Tab,
  Paper,
  Fade,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import { FaWeight, FaChartLine, FaDumbbell, FaRunning } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import BodyLogTab from "../components/statistics/BodyLogTab";
import ExerciseWeightTab from "../components/statistics/ExerciseWeightTab";
import BodyPartVolumeTab from "../components/statistics/BodyPartVolumeTab";
import CardioRecordTab from "../components/statistics/CardioRecordTab";

// 색상 테마
const theme = {
  primary: "#4a90e2",
  secondary: "#f5f5f5",
  text: "#333333",
  lightText: "#666666",
  background: "#ffffff",
  accent: "#e6f7ff",
  success: "#52c41a",
  error: "#f5222d",
  warning: "#faad14",
  border: "#e8e8e8",
  shadow: "rgba(0, 0, 0, 0.1)",
};

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 스타일 컴포넌트
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  color: ${theme.text};
  margin-bottom: 10px;
  font-weight: 600;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: ${theme.lightText};
  max-width: 700px;
  margin: 0 auto;
`;

const StatsContainer = styled(Paper)`
  background-color: ${theme.background};
  border-radius: 12px;
  box-shadow: 0 4px 20px ${theme.shadow};
  overflow: hidden;
  margin-bottom: 40px;
  transition: all 0.3s ease;
`;

const TabContainer = styled.div`
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${theme.border};
  }
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: ${theme.primary};
    height: 3px;
  }
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  font-weight: 500;
  padding: 16px;
  transition: all 0.2s ease;

  &.Mui-selected {
    color: ${theme.primary};
    font-weight: 600;
  }

  &:hover {
    background-color: ${theme.accent};
  }

  @media (max-width: 600px) {
    padding: 12px 8px;
    min-width: auto;
  }
`;

const TabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: inherit;
`;

const TabContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.div`
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

// 타입 정의
interface RootState {
  auth: {
    userInfo: {
      id: string;
      email: string;
      name: string;
    };
  };
}

// 차트 타입 정의
type ChartType = "bodyLog" | "exerciseWeight" | "cardio" | "bodyPartVolume";

// 차트 설정 정의
interface ChartConfig {
  value: ChartType;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

// 차트 설정 배열 정의
const useChartConfigs = (): ChartConfig[] => {
  return useMemo(
    () => [
      {
        value: "bodyLog",
        label: "바디로그",
        icon: <FaWeight />,
        component: <BodyLogTab />,
      },
      {
        value: "exerciseWeight",
        label: "웨이트 기록 변화",
        icon: <FaChartLine />,
        component: <ExerciseWeightTab />,
      },
      {
        value: "cardio",
        label: "유산소 기록",
        icon: <FaRunning />,
        component: <CardioRecordTab />,
      },
      {
        value: "bodyPartVolume",
        label: "운동 볼륨",
        icon: <FaDumbbell />,
        component: <BodyPartVolumeTab />,
      },
    ],
    []
  );
};

// 메인 컴포넌트
const StatisticsPage: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<ChartType>("bodyLog");
  const materialTheme = useTheme();
  const isMobile = useMediaQuery(materialTheme.breakpoints.down("sm"));
  const chartConfigs = useChartConfigs();

  // 현재 활성화된 차트 정보
  const activeConfig = useMemo(
    () => chartConfigs.find((config) => config.value === activeChart),
    [chartConfigs, activeChart]
  );

  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  // 사용자 정보가 없으면 렌더링하지 않음
  if (!userInfo) return null;

  return (
    <PageContainer>
      <StatsContainer elevation={0}>
        <TabContainer>
          <StyledTabs
            value={activeChart}
            onChange={(_, newValue) => setActiveChart(newValue as ChartType)}
            centered
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
          >
            {chartConfigs.map((config) => (
              <StyledTab
                key={config.value}
                value={config.value}
                label={
                  <TabContent>
                    <TabIcon>{config.icon}</TabIcon>
                    <Typography variant="body1" component="span">
                      {config.label}
                    </Typography>
                  </TabContent>
                }
              />
            ))}
          </StyledTabs>
        </TabContainer>

        <Fade in={true} timeout={300}>
          <ContentContainer>{activeConfig?.component}</ContentContainer>
        </Fade>
      </StatsContainer>
    </PageContainer>
  );
};

export default StatisticsPage;
