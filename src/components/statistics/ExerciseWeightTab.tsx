import React, { useState, useEffect } from "react";
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
  TooltipItem,
} from "chart.js";
import { fetchExercisesAPI } from "../../api/exercise";
import {
  getExerciseWeightStatsAPI,
  ExerciseWeightStatsDTO,
  ExerciseWeightStats,
  ExerciseWeightDataPoint,
} from "../../api/statistics";
import { ExerciseDTO } from "../../dtos/WorkoutDTO";

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

const ModalContent = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
`;

const SelectedExerciseContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
`;

const ExerciseTag = styled.div`
  display: flex;
  align-items: center;
  background-color: #e6f7ff;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
`;

const RemoveButton = styled.span`
  margin-left: 8px;
  color: #999;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    color: #ff4d4f;
  }
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

const ChartWrapper = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  height: 300px;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
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
      type: "category", // x축을 카테고리 타입으로 설정
      title: {
        display: false,
        text: "날짜",
      },
    },
    y: {
      beginAtZero: true, // y축을 0부터 시작하도록 설정
      title: {
        display: true,
        text: "무게 (kg)",
      },
    },
  },
  maintainAspectRatio: false,
});

// 검색 모달 컴포넌트
const ExerciseSearchModal = styled.div`
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
`;

const CategoryButton = styled.button<{ isActive: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  background: ${(props) => (props.isActive ? "#4a90e2" : "#f0f0f0")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.isActive ? "#4a90e2" : "#e0e0e0")};
  }
`;

const ExerciseList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 15px;
`;

const ExerciseItem = styled.div<{ isSelected: boolean }>`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) =>
    props.isSelected ? "#e6f7ff" : "transparent"};

  &:hover {
    background-color: ${(props) => (props.isSelected ? "#d6f0ff" : "#f5f5f5")};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
`;

const ConfirmButton = styled(ActionButton)`
  background-color: #4a90e2;
  color: white;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(ActionButton)`
  background-color: #f0f0f0;
  color: #333;
`;

const ExerciseWeightTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("3months");
  const [interval, setInterval] = useState("all");
  const [rm, setRm] = useState("over8RM");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDTO[]>([]);

  // 검색 모달 관련 상태
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tempSelectedExercises, setTempSelectedExercises] = useState<
    ExerciseDTO[]
  >([]);

  // 통계 데이터 관련 상태 추가
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExerciseWeightStatsDTO | null>(null);

  // 운동 데이터 로드
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercisesAPI();
        // 유산소 운동 제외
        const strengthExercises = data.filter(
          (ex) => ex.exerciseType !== "유산소"
        );

        setExercises(strengthExercises);
        setFilteredExercises(strengthExercises);

        // 카테고리 추출
        const uniqueCategories = [
          ...new Set(strengthExercises.map((ex) => ex.exerciseType)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("운동 목록을 불러오는데 실패했습니다:", error);
      }
    };

    loadExercises();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
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

  // 통계 데이터 로드
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
          period: period as any,
          interval: interval as any,
          rm: rm as any,
          exerciseSeqs: selectedExercises.map((ex) => ex.exerciseSeq),
        });
        setStats(data);
      } catch (err: any) {
        console.error("운동 무게 통계 데이터 로드 실패:", err);
        setError("데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedExercises, period, interval, rm]);

  // 모달 열기
  const handleOpenModal = () => {
    setTempSelectedExercises([...selectedExercises]);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setSearchTerm("");
    setSelectedCategory(null);
  };

  // 카테고리 선택
  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  // 운동 선택/해제
  const handleExerciseClick = (exercise: ExerciseDTO) => {
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
  };

  // 선택 확정
  const handleConfirmSelection = () => {
    setSelectedExercises(tempSelectedExercises);
    handleCloseModal();
  };

  // 선택된 운동 제거
  const removeSelectedExercise = (exerciseSeq: number) => {
    setSelectedExercises((prev) =>
      prev.filter((ex) => ex.exerciseSeq !== exerciseSeq)
    );
  };

  // 차트 데이터 생성 - 단일 운동용
  const getChartDataForSingleExercise = (
    exerciseStats: ExerciseWeightStats
  ) => {
    const randomColors = [
      {
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
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

    // 운동 타입별로 색상 선택
    const exerciseType = exerciseStats.exerciseType || "";
    let colorIndex = 0;

    if (exerciseType.includes("가슴")) colorIndex = 0;
    else if (exerciseType.includes("등")) colorIndex = 1;
    else if (exerciseType.includes("하체")) colorIndex = 2;
    else if (exerciseType.includes("어깨")) colorIndex = 3;
    else if (exerciseType.includes("팔")) colorIndex = 4;
    else colorIndex = exerciseStats.exerciseSeq % randomColors.length;

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
          borderColor: randomColors[colorIndex].borderColor,
          backgroundColor: randomColors[colorIndex].backgroundColor,
          tension: 0.2,
          isEstimatedData: sortedData.map((point) => point.isEstimated),
          pointStyle: sortedData.map((point) =>
            point.isEstimated ? "triangle" : "circle"
          ),
          pointRadius: sortedData.map((point) => (point.isEstimated ? 5 : 3)),
        },
      ],
    };
  };

  // RM 타입에 따른 제목 생성
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

        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>RM</InputLabel>
          <Select
            value={rm}
            onChange={(e) => setRm(e.target.value as string)}
            label="rm"
          >
            <MenuItem value="1RM">1RM</MenuItem>
            <MenuItem value="5RM">5RM</MenuItem>
            <MenuItem value="over8RM">본세트</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenModal}
          size="small"
        >
          운동 선택
        </Button>
      </FiltersContainer>

      {/* 선택된 운동 표시 */}
      {selectedExercises.length > 0 && (
        <SelectedExerciseContainer>
          {selectedExercises.map((exercise) => (
            <ExerciseTag key={exercise.exerciseSeq}>
              {exercise.exerciseName}
              <RemoveButton
                onClick={() => removeSelectedExercise(exercise.exerciseSeq)}
              >
                ×
              </RemoveButton>
            </ExerciseTag>
          ))}
        </SelectedExerciseContainer>
      )}

      {/* 무게 변화 차트 */}
      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : selectedExercises.length === 0 ? (
        <ChartContainer>
          <ChartTitle>운동별 무게 변화</ChartTitle>
          <ChartPlaceholder>
            운동을 선택하여 무게 변화 추이를 확인하세요
          </ChartPlaceholder>
        </ChartContainer>
      ) : stats && stats.exercises.length > 0 ? (
        <Grid container spacing={2}>
          {stats.exercises.map((exerciseStats) => (
            <Grid item xs={12} key={exerciseStats.exerciseSeq}>
              <ChartWrapper>
                <ChartTitle>
                  {exerciseStats.exerciseName} {getRmTitle(rm)}
                </ChartTitle>
                {exerciseStats.data.length > 0 ? (
                  <Line
                    options={getChartOptions(
                      `${exerciseStats.exerciseName} 무게 변화`
                    )}
                    data={getChartDataForSingleExercise(exerciseStats)}
                  />
                ) : (
                  <NoDataMessage>
                    해당 기간에 {exerciseStats.exerciseName}의 무게 데이터가
                    없습니다.
                  </NoDataMessage>
                )}
              </ChartWrapper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <ChartContainer>
          <ChartTitle>운동별 무게 변화</ChartTitle>
          <ChartPlaceholder>
            선택한 운동의 무게 데이터가 없습니다. 다른 운동을 선택하거나 기간을
            변경해보세요.
          </ChartPlaceholder>
        </ChartContainer>
      )}

      {/* 운동 선택 모달 */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="exercise-search-modal"
      >
        <ModalContent>
          <h3>운동 검색</h3>
          <ExerciseSearchModal>
            <SearchInput
              type="text"
              placeholder="운동 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <CategoryFilter>
              {categories.map((category) => (
                <CategoryButton
                  key={category}
                  isActive={selectedCategory === category}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </CategoryButton>
              ))}
            </CategoryFilter>

            <ExerciseList>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => {
                  const isSelected = tempSelectedExercises.some(
                    (ex) => ex.exerciseSeq === exercise.exerciseSeq
                  );
                  return (
                    <ExerciseItem
                      key={exercise.exerciseSeq}
                      onClick={() => handleExerciseClick(exercise)}
                      isSelected={isSelected}
                    >
                      <span>{exercise.exerciseName}</span>
                      {isSelected && (
                        <span style={{ color: "#4a90e2" }}>✓</span>
                      )}
                    </ExerciseItem>
                  );
                })
              ) : (
                <ExerciseItem isSelected={false}>
                  검색 결과가 없습니다
                </ExerciseItem>
              )}
            </ExerciseList>

            <ActionButtonContainer>
              <CancelButton onClick={handleCloseModal}>취소</CancelButton>
              <ConfirmButton
                onClick={handleConfirmSelection}
                disabled={tempSelectedExercises.length === 0}
              >
                {tempSelectedExercises.length > 0
                  ? `${tempSelectedExercises.length}개 운동 선택하기`
                  : "운동 선택하기"}
              </ConfirmButton>
            </ActionButtonContainer>
          </ExerciseSearchModal>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ExerciseWeightTab;
