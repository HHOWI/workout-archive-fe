import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  CircularProgress,
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

const Container = styled.div`
  margin-top: 20px;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const ChartWrapper = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  text-align: center;
  padding: 20px;
`;

// 추정치 정보를 툴팁에 표시하는 함수
const customTooltipCallback = (context: any) => {
  // 추정치 여부 데이터 가져오기 - 안전하게 접근
  const dataIndex = context.dataIndex;
  const datasetIndex = context.datasetIndex;

  // 데이터셋에서 직접 isEstimatedData 배열 가져오기
  const dataset = context.chart.data.datasets[datasetIndex];
  const isEstimated = dataset?.isEstimatedData?.[dataIndex];

  // 기본 표시 내용
  let tooltipText = [`${context.dataset.label}: ${context.formattedValue}`];

  // 추정치인 경우 안내 메시지 추가
  if (isEstimated) {
    tooltipText.push("(추정치)");
  }

  return tooltipText;
};

// 몸무게 차트 옵션
const getBodyWeightChartOptions = (title: string): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
    tooltip: {
      callbacks: {
        label: customTooltipCallback,
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
    },
    y: {
      min: 30, // 최소값 30kg
      title: {
        display: true,
        text: "체중 (kg)",
      },
    },
  },
  maintainAspectRatio: false,
});

// 골격근량 차트 옵션
const getMuscleMassChartOptions = (title: string): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
    tooltip: {
      callbacks: {
        label: customTooltipCallback,
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
    },
    y: {
      min: 10, // 최소값 10kg
      max: 80, // 최대값 80kg
      title: {
        display: true,
        text: "골격근량 (kg)",
      },
    },
  },
  maintainAspectRatio: false,
});

// 체지방률 차트 옵션
const getBodyFatChartOptions = (title: string): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
    tooltip: {
      callbacks: {
        label: customTooltipCallback,
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
    },
    y: {
      min: 0, // 최소값 10%
      max: 40, // 최대값 50%
      title: {
        display: true,
        text: "체지방률 (%)",
      },
    },
  },
  maintainAspectRatio: false,
});

const BodyLogTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("3months");
  const [interval, setInterval] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BodyLogStatsDTO | null>(null);

  // 데이터 로드
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

  // 차트 데이터 가공
  const getChartData = (label: string, data: BodyLogDataPoint[]) => {
    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label,
          data: data.map((item) => item.value),
          borderColor:
            label === "체중 (kg)"
              ? "rgb(53, 162, 235)"
              : label === "골격근량 (kg)"
              ? "rgb(75, 192, 192)"
              : "rgb(255, 99, 132)",
          backgroundColor:
            label === "체중 (kg)"
              ? "rgba(53, 162, 235, 0.5)"
              : label === "골격근량 (kg)"
              ? "rgba(75, 192, 192, 0.5)"
              : "rgba(255, 99, 132, 0.5)",
          tension: 0.2,
          // 추정치 정보를 내부 속성으로 저장
          isEstimatedData: data.map((item) => item.isEstimated),
          // 추정치에 대한 시각적 표현
          pointStyle: data.map(
            (item) =>
              item.isEstimated
                ? "triangle" // 추정치는 삼각형으로 표시
                : "circle" // 실제 데이터는 원으로 표시
          ),
          pointRadius: data.map((item) => (item.isEstimated ? 5 : 3)), // 추정치는 약간 더 크게
        },
      ],
    };
  };

  return (
    <Container>
      <FiltersContainer>
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>기간</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as string)}
            label="기간"
          >
            <MenuItem value="1months">최근 1개월</MenuItem>
            <MenuItem value="3months">최근 3개월</MenuItem>
            <MenuItem value="6months">최근 6개월</MenuItem>
            <MenuItem value="1year">최근 1년</MenuItem>
            <MenuItem value="2years">최근 2년</MenuItem>
            <MenuItem value="all">전체 기간</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>주기</InputLabel>
          <Select
            value={interval}
            onChange={(e) => setInterval(e.target.value as string)}
            label="주기"
          >
            <MenuItem value="1week">1주</MenuItem>
            <MenuItem value="2weeks">2주</MenuItem>
            <MenuItem value="4weeks">4주</MenuItem>
            <MenuItem value="3months">3개월</MenuItem>
            <MenuItem value="all">전체보기</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>

      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : stats ? (
        <Grid container spacing={2}>
          {/* 몸무게 차트 */}
          <Grid item xs={12}>
            <ChartWrapper style={{ height: "300px" }}>
              <ChartTitle>몸무게 변화</ChartTitle>
              <Line
                options={getBodyWeightChartOptions("체중 추이")}
                data={getChartData("체중 (kg)", stats.bodyWeight)}
              />
            </ChartWrapper>
          </Grid>

          {/* 골격근량 차트 */}
          <Grid item xs={12} md={6}>
            <ChartWrapper style={{ height: "250px" }}>
              <ChartTitle>골격근량 변화</ChartTitle>
              <Line
                options={getMuscleMassChartOptions("골격근량 추이")}
                data={getChartData("골격근량 (kg)", stats.muscleMass)}
              />
            </ChartWrapper>
          </Grid>

          {/* 체지방량 차트 */}
          <Grid item xs={12} md={6}>
            <ChartWrapper style={{ height: "250px" }}>
              <ChartTitle>체지방량 변화</ChartTitle>
              <Line
                options={getBodyFatChartOptions("체지방률 추이")}
                data={getChartData("체지방률 (%)", stats.bodyFat)}
              />
            </ChartWrapper>
          </Grid>
        </Grid>
      ) : (
        <ErrorMessage>
          데이터가 없습니다. 바디로그를 먼저 기록해주세요.
        </ErrorMessage>
      )}
    </Container>
  );
};

export default BodyLogTab;
