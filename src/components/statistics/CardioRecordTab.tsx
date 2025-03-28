import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Modal,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Chip,
  TextField,
  Divider,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { fetchExercisesAPI } from "../../api/exercise";
import { getCardioStatsAPI, CardioStatsDTO } from "../../api/statistics";
import { ExerciseDTO } from "../../dtos/WorkoutDTO";
import zoomPlugin from "chartjs-plugin-zoom";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

const ChartSection = styled(Box)`
  margin-bottom: 24px;
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

const ModalContent = styled(Paper)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px;
`;

const ModalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SelectedExerciseContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
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

const NoDataMessage = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
`;

// 검색 모달 컴포넌트
const SearchInputContainer = styled(Box)`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
`;

const ExerciseList = styled(Paper)`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  border: 1px solid #eee;
`;

const ExerciseItem = styled(Box)<{ isSelected: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.isSelected ? "rgba(25, 118, 210, 0.08)" : "transparent"};

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? "rgba(25, 118, 210, 0.12)" : "rgba(0, 0, 0, 0.04)"};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ActionButtonContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

// ===== 상수 및 유틸리티 =====
const PERIOD_OPTIONS = [
  { value: "1months", label: "최근 1개월" },
  { value: "3months", label: "최근 3개월" },
  { value: "6months", label: "최근 6개월" },
  { value: "1year", label: "최근 1년" },
  { value: "2years", label: "최근 2년" },
  { value: "all", label: "전체 기간" },
];

// ===== 차트 옵션 =====
// 공통 차트 옵션 기본값
const getBaseChartOptions = (title: string): ChartOptions<any> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        boxWidth: 12,
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 14,
        weight: "bold",
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
      grid: {
        display: false,
      },
    },
  },
  maintainAspectRatio: false,
});

// 차트 옵션 설정 (거리 - 막대그래프)
const getDistanceChartOptions = (title: string): ChartOptions<"bar"> => {
  const baseOptions = getBaseChartOptions(title) as ChartOptions<"bar">;
  return {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "거리 (km)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    datasets: {
      bar: {
        barThickness: 20,
        maxBarThickness: 30,
        borderRadius: 4,
      },
    },
  };
};

// 차트 옵션 설정 (시간, 속도 - 꺾은선 그래프)
const getLineChartOptions = (
  title: string,
  yAxisTitle: string
): ChartOptions<"line"> => {
  const baseOptions = getBaseChartOptions(title) as ChartOptions<"line">;
  return {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisTitle,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };
};

// 차트 색상
const CHART_COLORS = {
  distance: {
    backgroundColor: "rgba(53, 162, 235, 0.5)",
    borderColor: "rgba(53, 162, 235, 1)",
  },
  duration: {
    backgroundColor: "rgba(75, 192, 192, 0.5)",
    borderColor: "rgba(75, 192, 192, 1)",
  },
  speed: {
    backgroundColor: "rgba(255, 99, 132, 0.5)",
    borderColor: "rgba(255, 99, 132, 1)",
  },
};

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
  setPeriod: (value: string) => void;
  onExerciseSelect: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  period,
  setPeriod,
  onExerciseSelect,
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

    <Button
      variant="outlined"
      color="primary"
      onClick={onExerciseSelect}
      size="small"
      startIcon={<SearchIcon />}
    >
      유산소 운동 선택
    </Button>
  </FiltersContainer>
);

// 선택된 운동 표시 컴포넌트
interface SelectedExercisesProps {
  exercises: ExerciseDTO[];
  onRemove: (seq: number) => void;
}

const SelectedExercises: React.FC<SelectedExercisesProps> = ({
  exercises,
  onRemove,
}) => {
  if (exercises.length === 0) return null;

  return (
    <SelectedExerciseContainer>
      {exercises.map((exercise) => (
        <Chip
          key={exercise.exerciseSeq}
          label={exercise.exerciseName}
          color="primary"
          variant="outlined"
          onDelete={() => onRemove(exercise.exerciseSeq)}
          sx={{ borderRadius: "16px" }}
        />
      ))}
    </SelectedExerciseContainer>
  );
};

// 운동 검색 모달 컴포넌트
interface ExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercises: ExerciseDTO[];
  selectedExercises: ExerciseDTO[];
  onExerciseSelect: (exercise: ExerciseDTO) => void;
  onConfirm: () => void;
}

const ExerciseSelectionModal: React.FC<ExerciseModalProps> = ({
  open,
  onClose,
  exercises,
  selectedExercises,
  onExerciseSelect,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDTO[]>([]);

  // 검색 및 필터링
  useEffect(() => {
    if (!exercises) return;

    // 검색어 필터링
    if (searchTerm) {
      const filtered = exercises.filter((ex) =>
        ex.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises(exercises);
    }
  }, [searchTerm, exercises]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="cardio-exercise-search-modal"
    >
      <ModalContent elevation={3}>
        <ModalHeader>
          <Typography variant="h6">유산소 운동 검색</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </ModalHeader>

        <SearchInputContainer>
          <TextField
            fullWidth
            placeholder="운동 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
            }}
          />
        </SearchInputContainer>

        <ExerciseList elevation={0}>
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => {
              const isSelected = selectedExercises.some(
                (ex) => ex.exerciseSeq === exercise.exerciseSeq
              );
              return (
                <ExerciseItem
                  key={exercise.exerciseSeq}
                  onClick={() => onExerciseSelect(exercise)}
                  isSelected={isSelected}
                >
                  <Typography>{exercise.exerciseName}</Typography>
                  {isSelected && <CheckIcon color="primary" fontSize="small" />}
                </ExerciseItem>
              );
            })
          ) : (
            <ExerciseItem isSelected={false}>
              <Typography color="textSecondary">
                검색 결과가 없습니다
              </Typography>
            </ExerciseItem>
          )}
        </ExerciseList>

        <Divider sx={{ my: 2 }} />
        <ActionButtonContainer>
          <Button variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={selectedExercises.length === 0}
            startIcon={<CheckIcon />}
          >
            {selectedExercises.length > 0
              ? `${selectedExercises.length}개 운동 선택하기`
              : "운동 선택하기"}
          </Button>
        </ActionButtonContainer>
      </ModalContent>
    </Modal>
  );
};

// 차트 컴포넌트
interface CardioChartProps {
  exerciseStats: CardioStatsDTO;
}

const CardioChart: React.FC<CardioChartProps> = ({ exerciseStats }) => {
  // 거리 차트 데이터 생성
  const distanceChartData = useMemo(() => {
    // null 값 필터링
    const validData = exerciseStats.distance.filter(
      (point) => point.value !== null
    );

    return {
      labels: validData.map((point) => point.date),
      datasets: [
        {
          label: `${exerciseStats.exerciseName} (km)`,
          data: validData.map((point) => point.value),
          backgroundColor: CHART_COLORS.distance.backgroundColor,
          borderColor: CHART_COLORS.distance.borderColor,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [exerciseStats]);

  // 시간 차트 데이터 생성
  const durationChartData = useMemo(() => {
    // null 값 필터링
    const validData = exerciseStats.duration.filter(
      (point) => point.value !== null
    );

    return {
      labels: validData.map((point) => point.date),
      datasets: [
        {
          label: `${exerciseStats.exerciseName} (분)`,
          data: validData.map((point) => point.value),
          borderColor: CHART_COLORS.duration.borderColor,
          backgroundColor: CHART_COLORS.duration.backgroundColor,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [exerciseStats]);

  // 평균 속도 차트 데이터 생성
  const speedChartData = useMemo(() => {
    // null 값 필터링
    const validData = exerciseStats.avgSpeed.filter(
      (point) => point.value !== null
    );

    return {
      labels: validData.map((point) => point.date),
      datasets: [
        {
          label: `${exerciseStats.exerciseName} (km/h)`,
          data: validData.map((point) => point.value),
          borderColor: CHART_COLORS.speed.borderColor,
          backgroundColor: CHART_COLORS.speed.backgroundColor,
          tension: 0.2,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [exerciseStats]);

  return (
    <ChartSection>
      <Typography variant="h6" gutterBottom>
        {exerciseStats.exerciseName} 운동 통계
      </Typography>

      <Grid container spacing={2}>
        {/* 거리 차트 (막대 그래프) */}
        <Grid item xs={12}>
          <ChartWrapper elevation={1}>
            <ChartTitle variant="subtitle1">
              {exerciseStats.exerciseName} 거리 (km)
            </ChartTitle>
            <Box sx={{ height: "300px" }}>
              {exerciseStats.distance.some((d) => d.value !== null) ? (
                <Bar
                  options={getDistanceChartOptions("거리 기록")}
                  data={distanceChartData}
                />
              ) : (
                <NoDataMessage>
                  <Typography variant="body2" color="textSecondary">
                    해당 기간에 거리 데이터가 없습니다.
                  </Typography>
                </NoDataMessage>
              )}
            </Box>
          </ChartWrapper>
        </Grid>

        {/* 시간 차트 (꺾은선 그래프) */}
        <Grid item xs={12} md={6}>
          <ChartWrapper elevation={1}>
            <ChartTitle variant="subtitle1">
              {exerciseStats.exerciseName} 시간 (분)
            </ChartTitle>
            <Box sx={{ height: "250px" }}>
              {exerciseStats.duration.some((d) => d.value !== null) ? (
                <Line
                  options={getLineChartOptions("시간 기록", "시간 (분)")}
                  data={durationChartData}
                />
              ) : (
                <NoDataMessage>
                  <Typography variant="body2" color="textSecondary">
                    해당 기간에 시간 데이터가 없습니다.
                  </Typography>
                </NoDataMessage>
              )}
            </Box>
          </ChartWrapper>
        </Grid>

        {/* 평균 속도 차트 (꺾은선 그래프) */}
        <Grid item xs={12} md={6}>
          <ChartWrapper elevation={1}>
            <ChartTitle variant="subtitle1">
              {exerciseStats.exerciseName} 평균 속도 (km/h)
            </ChartTitle>
            <Box sx={{ height: "250px" }}>
              {exerciseStats.avgSpeed.some((d) => d.value !== null) ? (
                <Line
                  options={getLineChartOptions("평균 속도", "속도 (km/h)")}
                  data={speedChartData}
                />
              ) : (
                <NoDataMessage>
                  <Typography variant="body2" color="textSecondary">
                    해당 기간에 속도 데이터가 없습니다.
                  </Typography>
                </NoDataMessage>
              )}
            </Box>
          </ChartWrapper>
        </Grid>
      </Grid>
    </ChartSection>
  );
};

// 빈 상태 컴포넌트
interface NoSelectionProps {
  message: string;
}

const NoSelection: React.FC<NoSelectionProps> = ({ message }) => (
  <ChartWrapper elevation={1}>
    <ChartTitle variant="h6">유산소 운동 기록</ChartTitle>
    <NoDataMessage sx={{ height: "300px" }}>
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    </NoDataMessage>
  </ChartWrapper>
);

// ===== 커스텀 훅 =====

// 운동 목록 로드 훅
const useExercises = () => {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExercisesAPI();
        // 유산소 운동만 필터링
        const cardioExercises = data.filter(
          (ex) => ex.exerciseType === "유산소"
        );
        setExercises(cardioExercises);
      } catch (err: any) {
        console.error("운동 목록을 불러오는데 실패했습니다:", err);
        setError("운동 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  return { exercises, loading, error };
};

// 통계 데이터 로드 훅
interface UseCardioStatsProps {
  period: string;
  selectedExercises: ExerciseDTO[];
}

const useCardioStats = ({ period, selectedExercises }: UseCardioStatsProps) => {
  const [stats, setStats] = useState<CardioStatsDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedExercises.length === 0) {
        setStats([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getCardioStatsAPI({
          period: period as any,
          exerciseSeqs: selectedExercises.map((ex) => ex.exerciseSeq),
        });
        setStats(data);
      } catch (err: any) {
        console.error("유산소 운동 통계 데이터 로드 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedExercises, period]);

  return { stats, loading, error };
};

// ===== 메인 컴포넌트 =====
const CardioRecordTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("3months");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDTO[]>([]);
  const [tempSelectedExercises, setTempSelectedExercises] = useState<
    ExerciseDTO[]
  >([]);

  // 데이터 로드
  const { exercises } = useExercises();
  const { stats, loading, error } = useCardioStats({
    period,
    selectedExercises,
  });

  // 모달 열기
  const handleOpenModal = useCallback(() => {
    setTempSelectedExercises([...selectedExercises]);
    setModalOpen(true);
  }, [selectedExercises]);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // 운동 선택/해제
  const handleExerciseClick = useCallback((exercise: ExerciseDTO) => {
    setTempSelectedExercises((prev) => {
      const isSelected = prev.some(
        (ex) => ex.exerciseSeq === exercise.exerciseSeq
      );
      if (isSelected) {
        return prev.filter((ex) => ex.exerciseSeq !== exercise.exerciseSeq);
      } else {
        if (prev.length >= 5) {
          alert("최대 5개까지 운동을 선택할 수 있습니다.");
          return prev;
        }
        return [...prev, exercise];
      }
    });
  }, []);

  // 선택 확정
  const handleConfirmSelection = useCallback(() => {
    setSelectedExercises(tempSelectedExercises);
    handleCloseModal();
  }, [tempSelectedExercises, handleCloseModal]);

  // 선택된 운동 제거
  const removeSelectedExercise = useCallback((exerciseSeq: number) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exerciseSeq !== exerciseSeq)
    );
  }, []);

  return (
    <Container>
      <Filters
        period={period}
        setPeriod={setPeriod}
        onExerciseSelect={handleOpenModal}
      />

      <SelectedExercises
        exercises={selectedExercises}
        onRemove={removeSelectedExercise}
      />

      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorMessage variant="body1">{error}</ErrorMessage>
      ) : selectedExercises.length === 0 ? (
        <NoSelection message="유산소 운동을 선택하여 기록을 확인하세요" />
      ) : stats && stats.length > 0 ? (
        <>
          {stats.map((exerciseStats) => (
            <CardioChart
              key={exerciseStats.exerciseSeq}
              exerciseStats={exerciseStats}
            />
          ))}
        </>
      ) : (
        <NoSelection message="선택한 운동의 기록이 없습니다. 다른 운동을 선택하거나 기간을 변경해보세요." />
      )}

      <ExerciseSelectionModal
        open={modalOpen}
        onClose={handleCloseModal}
        exercises={exercises}
        selectedExercises={tempSelectedExercises}
        onExerciseSelect={handleExerciseClick}
        onConfirm={handleConfirmSelection}
      />
    </Container>
  );
};

export default CardioRecordTab;
