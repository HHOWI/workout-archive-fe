import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  CircularProgress,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { getBodyLogStatsAPI } from "../../api/statistics";
import { BodyLogDataPoint, BodyLogStatsDTO } from "../../dtos/BodyLogDTO";
import zoomPlugin from "chartjs-plugin-zoom";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

// ===== 스타일 컴포넌트 =====
const Container = styled(Box)`
  margin-top: 20px;
`;

const FiltersContainer = styled(Box)`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ChartWrapper = styled(Paper)`
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled(Typography)`
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
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

// ===== 유틸리티 및 상수 =====
const PERIOD_OPTIONS = [
  { value: "1months", label: "최근 1개월" },
  { value: "3months", label: "최근 3개월" },
  { value: "6months", label: "최근 6개월" },
  { value: "1year", label: "최근 1년" },
  { value: "2years", label: "최근 2년" },
  { value: "all", label: "전체 기간" },
];

const INTERVAL_OPTIONS = [
  { value: "1week", label: "1주" },
  { value: "2weeks", label: "2주" },
  { value: "4weeks", label: "4주" },
  { value: "3months", label: "3개월" },
  { value: "all", label: "전체보기" },
];

// 추정치 정보를 툴팁에 표시하는 함수
const customTooltipCallback = (context: any) => {
  const dataIndex = context.dataIndex;
  const datasetIndex = context.datasetIndex;
  const dataset = context.chart.data.datasets[datasetIndex];
  const isEstimated = dataset?.isEstimatedData?.[dataIndex];

  const tooltipText = [`${context.dataset.label}: ${context.formattedValue}`];

  if (isEstimated) {
    tooltipText.push("(추정치)");
  }

  return tooltipText;
};

// ===== 차트 옵션 정의 =====
const getChartOptions = (
  title: string,
  yAxisLabel: string,
  yMin: number = 0,
  yMax?: number
): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 14,
        weight: "bold",
      },
    },
    tooltip: {
      callbacks: {
        label: customTooltipCallback,
      },
    },
    zoom: {
      pan: {
        enabled: true,
        mode: "x",
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: "x",
      },
    },
  },
  scales: {
    x: {
      type: "category",
      title: {
        display: true,
        text: "날짜",
      },
      grid: {
        display: false,
      },
    },
    y: {
      min: yMin,
      max: yMax,
      title: {
        display: true,
        text: yAxisLabel,
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
  maintainAspectRatio: false,
});

// ===== 컴포넌트 =====
// 로딩 컴포넌트
const LoadingIndicator = () => (
  <LoadingContainer>
    <CircularProgress size={40} thickness={4} />
  </LoadingContainer>
);

// 필터 컴포넌트
interface FiltersProps {
  period: string;
  setPeriod: (period: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  period,
  setPeriod,
  interval,
  setInterval,
}) => (
  <FiltersContainer>
    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
      <InputLabel>기간</InputLabel>
      <Select
        value={period}
        onChange={(e) => setPeriod(e.target.value as string)}
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
        onChange={(e) => setInterval(e.target.value as string)}
        label="주기"
      >
        {INTERVAL_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </FiltersContainer>
);

// 차트 컴포넌트
interface ChartProps {
  title: string;
  label: string;
  data: BodyLogDataPoint[];
  yAxisLabel: string;
  yMin?: number;
  yMax?: number;
  height?: string;
  color: {
    borderColor: string;
    backgroundColor: string;
  };
}

const BodyLogChart: React.FC<ChartProps> = ({
  title,
  label,
  data,
  yAxisLabel,
  yMin,
  yMax,
  height = "300px",
  color,
}) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.date),
      datasets: [
        {
          label,
          data: data.map((item) => item.value),
          borderColor: color.borderColor,
          backgroundColor: color.backgroundColor,
          tension: 0.2,
          isEstimatedData: data.map((item) => item.isEstimated),
          pointStyle: data.map((item) =>
            item.isEstimated ? "triangle" : "circle"
          ),
          pointRadius: data.map((item) => (item.isEstimated ? 5 : 3)),
          borderWidth: 2,
        },
      ],
    }),
    [data, label, color]
  );

  return (
    <ChartWrapper elevation={1}>
      <ChartTitle variant="h6">{title}</ChartTitle>
      <Box sx={{ height }}>
        <Line
          options={getChartOptions(`${label} 추이`, yAxisLabel, yMin, yMax)}
          data={chartData}
        />
      </Box>
    </ChartWrapper>
  );
};

// ===== 커스텀 훅 =====
interface UseBodyLogDataProps {
  period: string;
  interval: string;
}

const useBodyLogData = ({ period, interval }: UseBodyLogDataProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BodyLogStatsDTO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBodyLogStatsAPI({
          period: period as any,
          interval: interval as any,
        });
        setStats(data);
      } catch (err: any) {
        console.error("바디로그 통계 데이터 로드 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, interval]);

  return { loading, error, stats };
};

// 차트 색상 정의
const CHART_COLORS = {
  bodyWeight: {
    borderColor: "rgb(53, 162, 235)",
    backgroundColor: "rgba(53, 162, 235, 0.3)",
  },
  muscleMass: {
    borderColor: "rgb(75, 192, 192)",
    backgroundColor: "rgba(75, 192, 192, 0.3)",
  },
  bodyFat: {
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.3)",
  },
};

// ===== 메인 컴포넌트 =====
const BodyLogTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("3months");
  const [interval, setInterval] = useState("all");

  // 데이터 로드
  const { loading, error, stats } = useBodyLogData({ period, interval });

  // 렌더링
  return (
    <Container>
      <Filters
        period={period}
        setPeriod={setPeriod}
        interval={interval}
        setInterval={setInterval}
      />

      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorMessage variant="body1">{error}</ErrorMessage>
      ) : stats ? (
        <Grid container spacing={2}>
          {/* 몸무게 차트 */}
          <Grid item xs={12}>
            <BodyLogChart
              title="몸무게 변화"
              label="체중 (kg)"
              data={stats.bodyWeight}
              yAxisLabel="체중 (kg)"
              yMin={30}
              height="320px"
              color={CHART_COLORS.bodyWeight}
            />
          </Grid>

          {/* 골격근량 차트 */}
          <Grid item xs={12} md={6}>
            <BodyLogChart
              title="골격근량 변화"
              label="골격근량 (kg)"
              data={stats.muscleMass}
              yAxisLabel="골격근량 (kg)"
              yMin={10}
              yMax={80}
              height="260px"
              color={CHART_COLORS.muscleMass}
            />
          </Grid>

          {/* 체지방량 차트 */}
          <Grid item xs={12} md={6}>
            <BodyLogChart
              title="체지방률 변화"
              label="체지방률 (%)"
              data={stats.bodyFat}
              yAxisLabel="체지방률 (%)"
              yMin={0}
              yMax={40}
              height="260px"
              color={CHART_COLORS.bodyFat}
            />
          </Grid>
        </Grid>
      ) : (
        <ErrorMessage variant="body1">
          데이터가 없습니다. 바디로그를 먼저 기록해주세요.
        </ErrorMessage>
      )}
    </Container>
  );
};

export default BodyLogTab;
