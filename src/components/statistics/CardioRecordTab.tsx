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

// 차트 옵션 설정 (거리 - 막대그래프)
const getDistanceChartOptions = (title: string): ChartOptions<"bar"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
    zoom: {
      pan: {
        enabled: true,
        mode: "x",
      },
      zoom: {
        wheel: {},
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
        display: false,
        text: "날짜",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "거리 (km)",
      },
    },
  },
  maintainAspectRatio: false,
  datasets: {
    bar: {
      barThickness: 20,
    },
  },
});

// 차트 옵션 설정 (시간, 속도 - 꺾은선 그래프)
const getLineChartOptions = (
  title: string,
  yAxisTitle: string
): ChartOptions<"line"> => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: title,
    },
    zoom: {
      pan: {
        enabled: true,
        mode: "x",
      },
      zoom: {
        wheel: {},
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
        display: false,
        text: "날짜",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: yAxisTitle,
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

const CardioRecordTab: React.FC = () => {
  // 상태 관리
  const [period, setPeriod] = useState("3months");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDTO[]>([]);

  // 검색 모달 관련 상태
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedExercises, setTempSelectedExercises] = useState<
    ExerciseDTO[]
  >([]);

  // 통계 데이터 관련 상태 추가
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CardioStatsDTO[]>([]);

  // 유산소 운동 데이터 로드
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await fetchExercisesAPI();
        // 유산소 운동만 필터링
        const cardioExercises = data.filter(
          (ex) => ex.exerciseType === "유산소"
        );

        setExercises(cardioExercises);
        setFilteredExercises(cardioExercises);
      } catch (error) {
        console.error("운동 목록을 불러오는데 실패했습니다:", error);
      }
    };

    loadExercises();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let result = exercises;

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter((ex) =>
        ex.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(result);
  }, [searchTerm, exercises]);

  // 통계 데이터 로드
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

  // 모달 열기
  const handleOpenModal = () => {
    setTempSelectedExercises([...selectedExercises]);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setSearchTerm("");
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

  // 거리 차트 데이터 생성
  const getDistanceChartData = (exerciseStats: CardioStatsDTO) => {
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
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgba(53, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // 시간 차트 데이터 생성
  const getDurationChartData = (exerciseStats: CardioStatsDTO) => {
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
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.2,
        },
      ],
    };
  };

  // 평균 속도 차트 데이터 생성
  const getSpeedChartData = (exerciseStats: CardioStatsDTO) => {
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
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
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
            <MenuItem value="1months">최근 1개월</MenuItem>
            <MenuItem value="3months">최근 3개월</MenuItem>
            <MenuItem value="6months">최근 6개월</MenuItem>
            <MenuItem value="1year">최근 1년</MenuItem>
            <MenuItem value="2years">최근 2년</MenuItem>
            <MenuItem value="all">전체 기간</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleOpenModal}
          size="small"
        >
          유산소 운동 선택
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

      {/* 유산소 운동 차트 */}
      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : selectedExercises.length === 0 ? (
        <ChartContainer>
          <ChartTitle>유산소 운동 기록</ChartTitle>
          <ChartPlaceholder>
            유산소 운동을 선택하여 기록을 확인하세요
          </ChartPlaceholder>
        </ChartContainer>
      ) : stats && stats.length > 0 ? (
        <div>
          {stats.map((exerciseStats) => (
            <div key={exerciseStats.exerciseSeq}>
              <h3>{exerciseStats.exerciseName} 운동 통계</h3>

              {/* 거리 차트 (막대 그래프) */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ChartWrapper>
                    <ChartTitle>
                      {exerciseStats.exerciseName} 거리 (km)
                    </ChartTitle>
                    {exerciseStats.distance.some((d) => d.value !== null) ? (
                      <Bar
                        options={getDistanceChartOptions("거리 기록")}
                        data={getDistanceChartData(exerciseStats)}
                      />
                    ) : (
                      <NoDataMessage>
                        해당 기간에 거리 데이터가 없습니다.
                      </NoDataMessage>
                    )}
                  </ChartWrapper>
                </Grid>

                {/* 시간 차트 (꺾은선 그래프) */}
                <Grid item xs={12} md={6}>
                  <ChartWrapper>
                    <ChartTitle>
                      {exerciseStats.exerciseName} 시간 (분)
                    </ChartTitle>
                    {exerciseStats.duration.some((d) => d.value !== null) ? (
                      <Line
                        options={getLineChartOptions("시간 기록", "시간 (분)")}
                        data={getDurationChartData(exerciseStats)}
                      />
                    ) : (
                      <NoDataMessage>
                        해당 기간에 시간 데이터가 없습니다.
                      </NoDataMessage>
                    )}
                  </ChartWrapper>
                </Grid>

                {/* 평균 속도 차트 (꺾은선 그래프) */}
                <Grid item xs={12} md={6}>
                  <ChartWrapper>
                    <ChartTitle>
                      {exerciseStats.exerciseName} 평균 속도 (km/h)
                    </ChartTitle>
                    {exerciseStats.avgSpeed.some((d) => d.value !== null) ? (
                      <Line
                        options={getLineChartOptions(
                          "평균 속도",
                          "속도 (km/h)"
                        )}
                        data={getSpeedChartData(exerciseStats)}
                      />
                    ) : (
                      <NoDataMessage>
                        해당 기간에 속도 데이터가 없습니다.
                      </NoDataMessage>
                    )}
                  </ChartWrapper>
                </Grid>
              </Grid>
            </div>
          ))}
        </div>
      ) : (
        <ChartContainer>
          <ChartTitle>유산소 운동 기록</ChartTitle>
          <ChartPlaceholder>
            선택한 운동의 기록이 없습니다. 다른 운동을 선택하거나 기간을
            변경해보세요.
          </ChartPlaceholder>
        </ChartContainer>
      )}

      {/* 유산소 운동 선택 모달 */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="cardio-exercise-search-modal"
      >
        <ModalContent>
          <h3>유산소 운동 검색</h3>
          <ExerciseSearchModal>
            <SearchInput
              type="text"
              placeholder="운동 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

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

export default CardioRecordTab;
