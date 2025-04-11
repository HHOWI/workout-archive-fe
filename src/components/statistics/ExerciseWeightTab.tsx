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
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
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
import { fetchExercisesAPI } from "../../api/exercise";
import {
  getExerciseWeightStatsAPI,
  ExerciseWeightStatsDTO,
  ExerciseWeightStats,
  ExerciseWeightDataPoint,
} from "../../api/statistics";
import { ExerciseDTO } from "../../dtos/WorkoutDTO";
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

// ===== 타입 정의 =====
type PeriodOption =
  | "1months"
  | "3months"
  | "6months"
  | "1year"
  | "2years"
  | "all";
type IntervalOption = "1week" | "2weeks" | "4weeks" | "3months" | "all";
type RmOption = "1RM" | "5RM" | "over8RM";

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

const ChartWrapper = styled(Paper)`
  padding: 16px;
  margin-bottom: 16px;
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

const CategoryFilterContainer = styled(Box)`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
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
const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: "1months", label: "최근 1개월" },
  { value: "3months", label: "최근 3개월" },
  { value: "6months", label: "최근 6개월" },
  { value: "1year", label: "최근 1년" },
  { value: "2years", label: "최근 2년" },
  { value: "all", label: "전체 기간" },
];

const INTERVAL_OPTIONS: { value: IntervalOption; label: string }[] = [
  { value: "1week", label: "1주" },
  { value: "2weeks", label: "2주" },
  { value: "4weeks", label: "4주" },
  { value: "3months", label: "3개월" },
  { value: "all", label: "전체보기" },
];

const RM_OPTIONS: { value: RmOption; label: string }[] = [
  { value: "1RM", label: "1RM" },
  { value: "5RM", label: "5RM" },
  { value: "over8RM", label: "본세트" },
];

// RM 옵션에 따른 제목 생성
const getRmTitle = (rmType: string) => {
  switch (rmType) {
    case "1RM":
      return "1회 최대 무게 (측정하지 않았다면 추정치 제공)";
    case "5RM":
      return "5회 최대 무게 (측정하지 않았다면 추정치 제공)";
    case "over8RM":
      return "본세트 무게 (8회 이상 최대 무게)";
    default:
      return "운동 무게";
  }
};

// 랜덤 색상 배열 정의
const CHART_COLORS = [
  {
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.3)",
  },
  {
    borderColor: "rgb(53, 162, 235)",
    backgroundColor: "rgba(53, 162, 235, 0.3)",
  },
  {
    borderColor: "rgb(75, 192, 192)",
    backgroundColor: "rgba(75, 192, 192, 0.3)",
  },
  {
    borderColor: "rgb(255, 159, 64)",
    backgroundColor: "rgba(255, 159, 64, 0.5)",
  },
  {
    borderColor: "rgb(153, 102, 255)",
    backgroundColor: "rgba(153, 102, 255, 0.5)",
  },
];

// 추정치 정보를 툴팁에 표시하는 함수
const customTooltipCallback = (context: any) => {
  // 추정치 여부 데이터 가져오기 - 안전하게 접근
  const dataIndex = context.dataIndex;
  const datasetIndex = context.datasetIndex;

  // 데이터셋에서 직접 isEstimatedData 배열 가져오기
  const dataset = context.chart.data.datasets[datasetIndex];
  const isEstimated = dataset?.isEstimatedData?.[dataIndex];

  // 기본 표시 내용
  let tooltipText = [`${context.dataset.label}: ${context.formattedValue} kg`];

  // 추정치인 경우 안내 메시지 추가
  if (isEstimated) {
    tooltipText.push("(추정치)");
  }

  return tooltipText;
};

// 차트 옵션 설정
const getChartOptions = (title: string): ChartOptions<"line"> => ({
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
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "무게 (kg)",
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
  period: PeriodOption;
  setPeriod: (period: PeriodOption) => void;
  interval: IntervalOption;
  setInterval: (interval: IntervalOption) => void;
  rm: RmOption;
  setRm: (rm: RmOption) => void;
  onExerciseSelect: () => void;
}

const Filters: React.FC<FiltersProps> = React.memo(
  ({
    period,
    setPeriod,
    interval,
    setInterval,
    rm,
    setRm,
    onExerciseSelect,
  }) => (
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

      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel>RM</InputLabel>
        <Select
          value={rm}
          onChange={(e) => setRm(e.target.value as RmOption)}
          label="RM"
        >
          {RM_OPTIONS.map((option) => (
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
        운동 선택
      </Button>
    </FiltersContainer>
  )
);
Filters.displayName = "ExerciseWeightFilters";

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

const MemoizedSelectedExercises = React.memo(SelectedExercises);
MemoizedSelectedExercises.displayName = "SelectedExercises";

// 차트 컴포넌트
interface WeightChartProps {
  exerciseStats: ExerciseWeightStats;
  rm: string;
}

const WeightChart: React.FC<WeightChartProps> = ({ exerciseStats, rm }) => {
  const theme = useTheme();

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    // 운동 타입별로 색상 선택
    const exerciseType = exerciseStats.exerciseType || "";
    let colorIndex = 0;

    if (exerciseType.includes("가슴")) colorIndex = 0;
    else if (exerciseType.includes("등")) colorIndex = 1;
    else if (exerciseType.includes("하체")) colorIndex = 2;
    else if (exerciseType.includes("어깨")) colorIndex = 3;
    else if (exerciseType.includes("팔")) colorIndex = 4;
    else colorIndex = exerciseStats.exerciseSeq % CHART_COLORS.length;

    // 서버 데이터에서 null 값 제외 및 날짜순 정렬
    const sortedData = exerciseStats.data
      .filter((point) => point.value !== null) // null 값 제거
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: sortedData.map((point) => point.date),
      datasets: [
        {
          label: `${exerciseStats.exerciseName} (kg)`,
          data: sortedData.map((point) => point.value),
          borderColor: CHART_COLORS[colorIndex].borderColor,
          backgroundColor: CHART_COLORS[colorIndex].backgroundColor,
          tension: 0.2,
          isEstimatedData: sortedData.map((point) => point.isEstimated),
          pointStyle: sortedData.map((point) =>
            point.isEstimated ? "triangle" : "circle"
          ),
          pointRadius: sortedData.map((point) => (point.isEstimated ? 5 : 3)),
          borderWidth: 2,
        },
      ],
    };
  }, [exerciseStats]);

  // 타이틀 생성
  const chartTitle = `${exerciseStats.exerciseName} ${getRmTitle(rm)}`;

  if (exerciseStats.data.length === 0) {
    return (
      <ChartWrapper elevation={1}>
        <ChartTitle variant="subtitle1">{chartTitle}</ChartTitle>
        <NoDataMessage sx={{ height: "300px" }}>
          <Typography variant="body1" color="textSecondary">
            해당 기간에 {exerciseStats.exerciseName}의 무게 데이터가 없습니다.
          </Typography>
        </NoDataMessage>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper elevation={1}>
      <ChartTitle variant="subtitle1">{chartTitle}</ChartTitle>
      <Box sx={{ height: "300px" }}>
        <Line
          options={getChartOptions(`${exerciseStats.exerciseName} 무게 변화`)}
          data={chartData}
        />
      </Box>
    </ChartWrapper>
  );
};

const MemoizedWeightChart = React.memo(WeightChart);
MemoizedWeightChart.displayName = "WeightChart";

// 빈 상태 컴포넌트
interface NoSelectionProps {
  message: string;
}

const NoSelection: React.FC<NoSelectionProps> = ({ message }) => (
  <ChartWrapper elevation={1}>
    <ChartTitle variant="h6">운동별 무게 변화</ChartTitle>
    <NoDataMessage sx={{ height: "300px" }}>
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
    </NoDataMessage>
  </ChartWrapper>
);

const MemoizedNoSelection = React.memo(NoSelection);
MemoizedNoSelection.displayName = "NoSelection";

// 운동 검색 모달 컴포넌트
interface ExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercises: ExerciseDTO[];
  selectedExercises: ExerciseDTO[];
  categories: string[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
  onExerciseSelect: (exercise: ExerciseDTO) => void;
  onConfirm: () => void;
}

const ExerciseSelectionModal: React.FC<ExerciseModalProps> = ({
  open,
  onClose,
  exercises,
  selectedExercises,
  categories,
  onCategorySelect,
  selectedCategory,
  onExerciseSelect,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDTO[]>([]);

  // 검색 및 필터링
  useEffect(() => {
    if (!exercises) return;

    let result = exercises;

    // 카테고리 필터링
    if (selectedCategory) {
      result = result.filter((ex) => ex.exerciseType === selectedCategory);
    }

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter((ex) =>
        ex.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(result);
  }, [searchTerm, selectedCategory, exercises]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="exercise-search-modal"
    >
      <ModalContent elevation={3}>
        <ModalHeader>
          <Typography variant="h6">운동 검색</Typography>
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

        <CategoryFilterContainer>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => onCategorySelect(category)}
              color={selectedCategory === category ? "primary" : "default"}
              variant={selectedCategory === category ? "filled" : "outlined"}
              icon={
                selectedCategory === category ? <FilterAltIcon /> : undefined
              }
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </CategoryFilterContainer>

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
                  <Typography>
                    {exercise.exerciseName}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({exercise.exerciseType})
                    </Typography>
                  </Typography>
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

const MemoizedExerciseSelectionModal = React.memo(ExerciseSelectionModal);
MemoizedExerciseSelectionModal.displayName = "ExerciseSelectionModal";

// ===== 커스텀 훅 =====

// 운동 목록 로드 훅
const useExercises = () => {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExercisesAPI();
        // 유산소 운동 제외
        const strengthExercises = data.filter(
          (ex) => ex.exerciseType !== "유산소"
        );

        setExercises(strengthExercises);

        // 카테고리 추출
        const uniqueCategories = [
          ...new Set(strengthExercises.map((ex) => ex.exerciseType)),
        ];
        setCategories(uniqueCategories);
      } catch (err: any) {
        console.error("운동 목록을 불러오는데 실패했습니다:", err);
        setError("운동 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  return { exercises, categories, loading, error };
};

// 통계 데이터 로드 훅
interface UseWeightStatsProps {
  period: PeriodOption;
  interval: IntervalOption;
  rm: RmOption;
  selectedExercises: ExerciseDTO[];
}

const useWeightStats = ({
  period,
  interval,
  rm,
  selectedExercises,
}: UseWeightStatsProps) => {
  const [stats, setStats] = useState<ExerciseWeightStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedExercises.length === 0) {
        setStats(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getExerciseWeightStatsAPI({
          period,
          interval,
          rm,
          exerciseSeqs: selectedExercises.map((ex) => ex.exerciseSeq),
        });
        setStats(data);
      } catch (err: any) {
        console.error("운동 무게 통계 데이터 로드 실패:", err);
        setError(
          err.response?.data?.message ||
            "데이터를 불러오는 데 실패했습니다. 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedExercises, period, interval, rm]);

  return { stats, loading, error };
};

// ===== 메인 컴포넌트 =====
const ExerciseWeightTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState<PeriodOption>("3months");
  const [interval, setInterval] = useState<IntervalOption>("all");
  const [rm, setRm] = useState<RmOption>("over8RM");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDTO[]>([]);
  const [tempSelectedExercises, setTempSelectedExercises] = useState<
    ExerciseDTO[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 운동 데이터 로드
  const { exercises, categories } = useExercises();

  // 통계 데이터 로드
  const { stats, loading, error } = useWeightStats({
    period,
    interval,
    rm,
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
    setSelectedCategory(null);
  }, []);

  // 카테고리 선택
  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
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

  // 공통 메시지 컴포넌트 활용 고려
  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (error) {
      return <ErrorMessage variant="body1">{error}</ErrorMessage>;
    }
    if (selectedExercises.length === 0) {
      return (
        <MemoizedNoSelection message="운동을 선택하여 무게 변화 추이를 확인하세요" />
      );
    }
    if (!stats || !stats.exercises || stats.exercises.length === 0) {
      return (
        <MemoizedNoSelection message="선택한 운동의 무게 데이터가 없습니다. 다른 운동을 선택하거나 기간을 변경해보세요." />
      );
    }
    return (
      <Grid container spacing={2}>
        {stats.exercises.map((exerciseStats) => (
          <Grid item xs={12} key={exerciseStats.exerciseSeq}>
            <MemoizedWeightChart exerciseStats={exerciseStats} rm={rm} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container>
      <Filters
        period={period}
        setPeriod={setPeriod}
        interval={interval}
        setInterval={setInterval}
        rm={rm}
        setRm={setRm}
        onExerciseSelect={handleOpenModal}
      />

      <MemoizedSelectedExercises
        exercises={selectedExercises}
        onRemove={removeSelectedExercise}
      />

      {renderContent()}

      <MemoizedExerciseSelectionModal
        open={modalOpen}
        onClose={handleCloseModal}
        exercises={exercises}
        selectedExercises={tempSelectedExercises}
        categories={categories}
        onCategorySelect={handleCategoryClick}
        selectedCategory={selectedCategory}
        onExerciseSelect={handleExerciseClick}
        onConfirm={handleConfirmSelection}
      />
    </Container>
  );
};

export default ExerciseWeightTab;
