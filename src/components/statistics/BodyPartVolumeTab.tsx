import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
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

const Container = styled.div`
  margin-top: 20px;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  height: 400px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const ChartPlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  background-color: white;
  border-radius: 4px;
  border: 1px dashed #ccc;
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

const NoDataMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

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
      },
    },
  },
  maintainAspectRatio: false,
  datasets: {
    bar: {
      barThickness: 30,
    },
  },
});

// 운동 부위 옵션
const bodyPartOptions = [
  { value: "chest", label: "가슴" },
  { value: "back", label: "등" },
  { value: "legs", label: "하체" },
  { value: "shoulders", label: "어깨" },
  { value: "triceps", label: "삼두" },
  { value: "biceps", label: "이두" },
  { value: "all", label: "전체" },
];

// 주기 옵션
const intervalOptions = [
  { value: "1week", label: "1주" },
  { value: "2weeks", label: "2주" },
  { value: "1month", label: "1개월" },
  { value: "3months", label: "3개월" },
  { value: "all", label: "전체보기" },
];

// 기간 옵션
const periodOptions = [
  { value: "1months", label: "최근 1개월" },
  { value: "3months", label: "최근 3개월" },
  { value: "6months", label: "최근 6개월" },
  { value: "1year", label: "최근 1년" },
  { value: "2years", label: "최근 2년" },
  { value: "all", label: "전체 기간" },
];

const BodyPartVolumeTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("1months");
  const [interval, setInterval] = useState("all");
  const [bodyPart, setBodyPart] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BodyPartVolumeStatsDTO | null>(null);

  // 통계 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getBodyPartVolumeStatsAPI({
          period: period as any,
          interval: interval as any,
          bodyPart: bodyPart as any,
        });
        setStats(data);
      } catch (err: any) {
        console.error("운동 볼륨 통계 데이터 로드 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, interval, bodyPart]);

  // 차트 데이터 생성
  const getChartData = (volumeData: VolumeDataPoint[]) => {
    return {
      labels: volumeData.map((point) => point.date),
      datasets: [
        {
          label: "볼륨",
          data: volumeData.map((point) => point.value),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // 운동 부위 한글 이름 가져오기
  const getBodyPartLabel = (bodyPartValue: string): string => {
    const option = bodyPartOptions.find(
      (option) => option.value === bodyPartValue
    );
    return option ? option.label : bodyPartValue;
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
            {periodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>주기</InputLabel>
          <Select
            value={interval}
            onChange={(e) => setInterval(e.target.value as string)}
            label="주기"
          >
            {intervalOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>운동 부위</InputLabel>
          <Select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value as string)}
            label="운동 부위"
          >
            {bodyPartOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FiltersContainer>

      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : stats && stats.volumeData.length > 0 ? (
        <ChartContainer>
          <ChartTitle>
            {getBodyPartLabel(stats.bodyPart)} 부위 운동 볼륨
          </ChartTitle>
          <Bar
            options={getChartOptions(
              `${getBodyPartLabel(stats.bodyPart)} 부위 운동 볼륨 추이`
            )}
            data={getChartData(stats.volumeData)}
          />
        </ChartContainer>
      ) : (
        <ChartContainer>
          <ChartTitle>{getBodyPartLabel(bodyPart)} 부위 운동 볼륨</ChartTitle>
          <NoDataMessage>
            선택한 기간에 {getBodyPartLabel(bodyPart)} 부위 운동 데이터가
            없습니다.
          </NoDataMessage>
        </ChartContainer>
      )}
    </Container>
  );
};

export default BodyPartVolumeTab;
