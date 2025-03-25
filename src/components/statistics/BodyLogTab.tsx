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
import { getBodyLogStatsAPI } from "../../api/bodyLog";
import { BodyLogStatsDTO } from "../../dtos/BodyLogDTO";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

interface BodyLogTabProps {
  // 필요한 props 정의
}

// 차트 옵션 설정
const getChartOptions = (title: string): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
  },
  scales: {
    y: {
      beginAtZero: false,
    },
  },
  maintainAspectRatio: false,
});

const BodyLogTab: React.FC<BodyLogTabProps> = () => {
  // 상태 관리
  const [period, setPeriod] = useState("1year");
  const [interval, setInterval] = useState("1week");
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
  const getChartData = (
    label: string,
    data: { date: string; value: number | null }[]
  ) => {
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
                options={getChartOptions("체중 추이")}
                data={getChartData("체중 (kg)", stats.bodyWeight)}
              />
            </ChartWrapper>
          </Grid>

          {/* 골격근량 차트 */}
          <Grid item xs={12} md={6}>
            <ChartWrapper style={{ height: "250px" }}>
              <ChartTitle>골격근량 변화</ChartTitle>
              <Line
                options={getChartOptions("골격근량 추이")}
                data={getChartData("골격근량 (kg)", stats.muscleMass)}
              />
            </ChartWrapper>
          </Grid>

          {/* 체지방량 차트 */}
          <Grid item xs={12} md={6}>
            <ChartWrapper style={{ height: "250px" }}>
              <ChartTitle>체지방량 변화</ChartTitle>
              <Line
                options={getChartOptions("체지방률 추이")}
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
