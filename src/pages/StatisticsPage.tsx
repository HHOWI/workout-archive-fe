import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import { Tabs, Tab } from "@mui/material";
import { FaWeight, FaChartLine, FaDumbbell } from "react-icons/fa";
import BodyLogTab from "../components/statistics/BodyLogTab";
import ExerciseWeightTab from "../components/statistics/ExerciseWeightTab";
import BodyPartVolumeTab from "../components/statistics/BodyPartVolumeTab";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
`;

const GraphContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 40px;
`;

const TabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const TabContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

const StatisticsPage: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState<ChartType>("bodyLog");

  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  // 차트 설정 배열
  const chartConfigs: ChartConfig[] = [
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
      icon: <FaChartLine />,
      component: <CardioRecordTab />,
    },
    {
      value: "bodyPartVolume",
      label: "운동 볼륨",
      icon: <FaDumbbell />,
      component: <BodyPartVolumeTab />,
    },
  ];

  if (!userInfo) return null;

  return (
    <Container>
      <GraphContainer>
        <Tabs
          value={activeChart}
          onChange={(_, newValue) => setActiveChart(newValue as ChartType)}
          centered
          variant="fullWidth"
        >
          {chartConfigs.map((config) => (
            <Tab
              key={config.value}
              value={config.value}
              icon={
                <TabContent>
                  <TabIcon>{config.icon}</TabIcon>
                  {config.label}
                </TabContent>
              }
            />
          ))}
        </Tabs>

        <FiltersContainer>{/* 필터 UI 컴팩트하게 정리 */}</FiltersContainer>

        {/* 현재 선택된 탭에 해당하는 컴포넌트 렌더링 */}
        {chartConfigs.find((config) => config.value === activeChart)?.component}
      </GraphContainer>
    </Container>
  );
};

export default StatisticsPage;
