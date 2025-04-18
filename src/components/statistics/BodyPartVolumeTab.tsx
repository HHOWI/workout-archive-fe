import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Box,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import {
  getBodyPartVolumeStatsAPI,
  BodyPartVolumeStatsDTO,
  VolumeDataPoint,
} from "../../api/statistics";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ===== 타입 정의 =====
type PeriodOption = "3months" | "6months" | "1year" | "2years" | "all";
type IntervalOption = "1week" | "2weeks" | "1month" | "3months" | "all";
type BodyPartOption =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "all";

// ===== 스타일 컴포넌트 =====
const Container = styled(Box)`
  margin-top: 20px;
`;

const FiltersContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

const ChartContainer = styled(Paper)`
  height: 400px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled(Typography)`
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
`;

const NoDataMessage = styled(Box)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  width: 100%;
`;

const ErrorMessage = styled(Typography)`
  color: #f44336;
  text-align: center;
  padding: 20px;
`;

// ===== 상수 및 유틸리티 =====

// 차트 옵션 설정
const getChartOptions = (title: string): ChartOptions<"bar"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      display: false,
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 14,
        weight: "bold",
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "볼륨 (무게×횟수×세트 kg)",
        padding: {
          bottom: 10,
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
  maintainAspectRatio: false,
  datasets: {
    bar: {
      barThickness: 30,
      maxBarThickness: 38,
      borderRadius: 4,
    },
  },
});

// 운동 부위 옵션
const BODY_PART_OPTIONS: { value: BodyPartOption; label: string }[] = [
  { value: "chest", label: "가슴" },
  { value: "back", label: "등" },
  { value: "legs", label: "하체" },
  { value: "shoulders", label: "어깨" },
  { value: "triceps", label: "삼두" },
  { value: "biceps", label: "이두" },
  { value: "all", label: "전체" },
];

// 주기 옵션
const INTERVAL_OPTIONS: { value: IntervalOption; label: string }[] = [
  { value: "1week", label: "1주" },
  { value: "2weeks", label: "2주" },
  { value: "1month", label: "1개월" },
  { value: "3months", label: "3개월" },
  { value: "all", label: "전체 보기" },
];

// 기간 옵션
const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: "3months", label: "최근 3개월" },
  { value: "6months", label: "최근 6개월" },
  { value: "1year", label: "최근 1년" },
  { value: "2years", label: "최근 2년" },
  { value: "all", label: "전체 기간" },
];

// ===== 컴포넌트 =====

// 로딩 컴포넌트
const LoadingIndicator = () => (
  <LoadingContainer>
    <CircularProgress size={40} thickness={4} />
  </LoadingContainer>
);

// 필터 컴포넌트
interface FiltersProps {
  period: PeriodOption;
  setPeriod: (value: PeriodOption) => void;
  interval: IntervalOption;
  setInterval: (value: IntervalOption) => void;
  bodyPart: BodyPartOption;
  setBodyPart: (value: BodyPartOption) => void;
}

const Filters: React.FC<FiltersProps> = React.memo(
  ({ period, setPeriod, interval, setInterval, bodyPart, setBodyPart }) => (
    <FiltersContainer>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>기간</InputLabel>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodOption)}
          label="기간"
        >
          {PERIOD_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>주기</InputLabel>
        <Select
          value={interval}
          onChange={(e) => setInterval(e.target.value as IntervalOption)}
          label="주기"
        >
          {INTERVAL_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
        <InputLabel>운동 부위</InputLabel>
        <Select
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value as BodyPartOption)}
          label="운동 부위"
        >
          {BODY_PART_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FiltersContainer>
  )
);
Filters.displayName = "BodyPartVolumeFilters";

// 볼륨 차트 컴포넌트
interface VolumeChartProps {
  stats: BodyPartVolumeStatsDTO | null;
  bodyPart: string;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ stats, bodyPart }) => {
  const theme = useTheme();

  // 운동 부위 한글 이름 가져오기
  const getBodyPartLabel = (bodyPartValue: string): string => {
    const option = BODY_PART_OPTIONS.find(
      (option) => option.value === bodyPartValue
    );
    return option ? option.label : bodyPartValue;
  };

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!stats || stats.volumeData.length === 0) return null;

    // 색상 설정 - 부위별로 다른 색상 사용
    let backgroundColor, borderColor;

    switch (stats.bodyPart) {
      case "chest":
        backgroundColor = "rgba(54, 162, 235, 0.6)";
        borderColor = "rgba(54, 162, 235, 1)";
        break;
      case "back":
        backgroundColor = "rgba(75, 192, 192, 0.6)";
        borderColor = "rgba(75, 192, 192, 1)";
        break;
      case "legs":
        backgroundColor = "rgba(255, 159, 64, 0.6)";
        borderColor = "rgba(255, 159, 64, 1)";
        break;
      case "shoulders":
        backgroundColor = "rgba(153, 102, 255, 0.6)";
        borderColor = "rgba(153, 102, 255, 1)";
        break;
      case "triceps":
        backgroundColor = "rgba(255, 99, 132, 0.6)";
        borderColor = "rgba(255, 99, 132, 1)";
        break;
      case "biceps":
        backgroundColor = "rgba(255, 205, 86, 0.6)";
        borderColor = "rgba(255, 205, 86, 1)";
        break;
      default:
        backgroundColor = "rgba(54, 162, 235, 0.6)";
        borderColor = "rgba(54, 162, 235, 1)";
    }

    return {
      labels: stats.volumeData.map((point) => point.date),
      datasets: [
        {
          label: "볼륨",
          data: stats.volumeData.map((point) => point.value),
          backgroundColor,
          borderColor,
          borderWidth: 1,
          hoverBackgroundColor: borderColor,
          hoverBorderWidth: 2,
        },
      ],
    };
  }, [stats]);

  const bodyPartLabel = getBodyPartLabel(stats?.bodyPart || bodyPart);
  const chartTitle = `${bodyPartLabel} 부위 운동 볼륨`;

  if (!stats || stats.volumeData.length === 0) {
    return (
      <ChartContainer elevation={1}>
        <ChartTitle variant="h6">{chartTitle}</ChartTitle>
        <NoDataMessage>
          <Typography variant="body1" color="textSecondary">
            선택한 기간에 {bodyPartLabel} 부위 운동 데이터가 없습니다.
          </Typography>
        </NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer elevation={1}>
      <ChartTitle variant="h6">{chartTitle}</ChartTitle>
      <Box sx={{ flex: 1, position: "relative" }}>
        <Bar
          options={getChartOptions(`${bodyPartLabel} 부위 운동 볼륨 추이`)}
          data={chartData!}
        />
      </Box>
    </ChartContainer>
  );
};

const MemoizedVolumeChart = React.memo(VolumeChart);
MemoizedVolumeChart.displayName = "VolumeChart";

// ===== 커스텀 훅 =====
interface UseVolumeDataProps {
  period: PeriodOption;
  interval: IntervalOption;
  bodyPart: BodyPartOption;
}

const useVolumeData = ({ period, interval, bodyPart }: UseVolumeDataProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BodyPartVolumeStatsDTO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBodyPartVolumeStatsAPI({
          period,
          interval,
          bodyPart,
        });
        setStats(data);
      } catch (err: any) {
        console.error("운동 볼륨 통계 데이터 로드 실패:", err);
        setError(
          err.response?.data?.message ||
            "데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, interval, bodyPart]);

  return { loading, error, stats };
};

// ===== 메인 컴포넌트 =====
const BodyPartVolumeTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState<PeriodOption>("3months");
  const [interval, setInterval] = useState<IntervalOption>("1week");
  const [bodyPart, setBodyPart] = useState<BodyPartOption>("all");

  // 통계 데이터 로드
  const { loading, error, stats } = useVolumeData({
    period,
    interval,
    bodyPart,
  });

  // 공통 메시지 컴포넌트 활용 고려
  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (error) {
      return <ErrorMessage variant="body1">{error}</ErrorMessage>;
    }
    // 데이터 없는 경우 메시지 VolumeChart 내부에서 처리
    return <MemoizedVolumeChart stats={stats} bodyPart={bodyPart} />;
  };

  return (
    <Container>
      <Filters
        period={period}
        setPeriod={setPeriod}
        interval={interval}
        setInterval={setInterval}
        bodyPart={bodyPart}
        setBodyPart={setBodyPart}
      />
      {renderContent()}
    </Container>
  );
};

export default BodyPartVolumeTab;
