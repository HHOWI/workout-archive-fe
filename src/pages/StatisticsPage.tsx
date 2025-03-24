import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";

// recharts 임포트
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import { getBodyLogsAPI } from "../api/bodyLog";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
`;

const ChartTypesContainer = styled.div`
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ active?: boolean }>`
  background: ${(props) => (props.active ? "#4a90e2" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#3a7bc5" : "#e0e0e0")};
  }
`;

const FiltersContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  flex-wrap: wrap;
`;

const FilterSection = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  min-width: 200px;
  max-width: 250px;

  &.compact {
    min-width: unset;
    width: auto;
  }
`;

const FilterTitle = styled.h3`
  font-size: 15px;
  color: #555;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
`;

const GraphContainer = styled.div`
  margin-bottom: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const ChartRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 992px) {
    flex-direction: row;
  }
`;

const ChartBox = styled.div`
  flex: 1;
  min-height: 250px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const ChartBoxTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 15px;
  color: #555;
  text-align: center;
`;

const NoDataMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-size: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const InputContainer = styled.div`
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &.horizontal {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;

  &.inline {
    margin-bottom: 0;
    min-width: 65px;
    font-size: 13px;
  }
`;

const NumberControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NumberInputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  overflow: hidden;
  transition: all 0.2s;
  max-width: 120px;

  &:focus-within {
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  }
`;

const NumberInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: none;
  font-size: 14px;
  color: #333;
  text-align: center;
  font-weight: 500;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const InputButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  color: #555;
  height: 30px;
  width: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }

  &:active {
    background: #d0d0d0;
  }

  &:first-of-type {
    border-right: 1px solid #ddd;
  }

  &:last-of-type {
    border-left: 1px solid #ddd;
  }
`;

const UnitLabel = styled.span`
  display: flex;
  align-items: center;
  padding-left: 2px;
  font-size: 13px;
  color: #555;
  font-weight: 500;
`;

const PeriodControl = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CustomSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  appearance: none;
  color: #333;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #555;
  pointer-events: none;
`;

const PeriodSettingsContainer = styled.div`
  position: absolute;
  top: 17px;
  right: 20px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
`;

const PeriodRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const CompactInputLabel = styled.label`
  font-size: 12px;
  color: #555;
  font-weight: 500;
  width: 34px;
  flex-shrink: 0;
`;

const CompactInputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  overflow: hidden;
  height: 24px;
  width: 50px;
  flex-shrink: 0;
`;

const CompactInputButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: none;
  color: #555;
  height: 24px;
  width: 18px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }

  &:first-of-type {
    border-right: 1px solid #ddd;
  }

  &:last-of-type {
    border-left: 1px solid #ddd;
  }
`;

const CompactInput = styled.input`
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  font-size: 12px;
  text-align: center;
  min-width: 14px;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const CompactUnitLabel = styled.span`
  font-size: 11px;
  color: #666;
  margin-left: 1px;
  flex-shrink: 0;
`;

const SelectorButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  width: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const SelectedItemLabel = styled.span`
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropdownIcon = styled.span`
  margin-left: 8px;
  color: #666;
  font-size: 12px;
`;

const CompactSelect = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background-color: white;
  cursor: pointer;
  appearance: none;
  color: #333;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

// 인터페이스 정의
interface BodyLogType {
  userInfoRecordSeq: number;
  height: number | null;
  bodyWeight: number | null;
  muscleMass: number | null;
  bodyFat: number | null;
  recordDate: string;
}

interface WorkoutSetType {
  weight: number;
  counts: number;
  exerciseName: string;
  bodyPart: string;
  workoutDate: string;
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number | null;
}

// Recharts의 formatter 타입 정의
type CustomTooltipFormatter = (
  value: ValueType,
  name: NameType,
  entry: any,
  index: number
) => [string | number, string];

// 차트 타입 정의
type ChartType = "bodyLog" | "exerciseWeight" | "bodyPartVolume";

// 더미 데이터 생성 함수 (실제 API 연동 전까지 사용)
const generateDummyWorkoutData = (): WorkoutSetType[] => {
  const exercises = [
    { name: "벤치 프레스", bodyPart: "가슴" },
    { name: "스쿼트", bodyPart: "하체" },
    { name: "데드리프트", bodyPart: "등" },
    { name: "오버헤드 프레스", bodyPart: "어깨" },
    { name: "바벨 로우", bodyPart: "등" },
    { name: "레그 프레스", bodyPart: "하체" },
    { name: "덤벨 프레스", bodyPart: "가슴" },
    { name: "랫 풀다운", bodyPart: "등" },
    { name: "레그 익스텐션", bodyPart: "하체" },
    { name: "푸쉬업", bodyPart: "가슴" },
  ];

  const result: WorkoutSetType[] = [];
  const today = new Date();

  // 최근 60일 동안의 더미 데이터 생성
  for (let i = 60; i >= 0; i -= 3) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");

    // 하루에 2-4개 운동을 랜덤하게 선택
    const exerciseCount = Math.floor(Math.random() * 3) + 2;
    const selectedExercises = [...exercises]
      .sort(() => 0.5 - Math.random())
      .slice(0, exerciseCount);

    selectedExercises.forEach((exercise) => {
      // 운동별로 3-5세트의 데이터를 생성
      const sets = Math.floor(Math.random() * 3) + 3;
      for (let j = 0; j < sets; j++) {
        // 무게는 이전 데이터의 85-110% 사이의 값으로 미세한 변화를 줌
        const baseWeight = exercise.name.includes("벤치")
          ? 60
          : exercise.name.includes("스쿼트")
          ? 80
          : exercise.name.includes("데드")
          ? 100
          : exercise.name.includes("오버헤드")
          ? 40
          : 50;

        // 날짜가 최근일수록 무게를 약간 증가
        const progressFactor = 1 + ((60 - i) / 60) * 0.2; // 최대 20% 증가
        const variationFactor = 0.85 + Math.random() * 0.25; // 85-110% 변동

        let weight = baseWeight * progressFactor * variationFactor;
        // 소수점 첫째 자리에서 반올림 (예: 2.5kg 단위)
        weight = Math.round(weight * 2) / 2;

        result.push({
          exerciseName: exercise.name,
          bodyPart: exercise.bodyPart,
          workoutDate: dateStr,
          weight: weight,
          counts: Math.floor(Math.random() * 4) + 8, // 8-12회
        });
      }
    });
  }

  return result;
};

// 커스텀 포맷터 함수
const bodyMetricFormatter = (value: ValueType, unit: string) => {
  if (value == null) return ["데이터 없음", ""];
  return [`${Number(value).toFixed(1)}${unit}`, ""];
};

const bodyMetricTooltipFormatter =
  (unit: string) => (value: ValueType, name: NameType) => {
    if (value == null) return ["데이터 없음", ""];
    return [`${Number(value).toFixed(1)}${unit}`, name as string];
  };

// 재사용 가능한 차트 컴포넌트
const BodyMetricChart = memo(
  ({
    data,
    dataKey,
    title,
    color,
    unit,
  }: {
    data: ChartDataPoint[];
    dataKey: string;
    title: string;
    color: string;
    unit: string;
  }) => (
    <ChartBox>
      <ChartBoxTitle>{title}</ChartBoxTitle>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip formatter={bodyMetricTooltipFormatter(unit)} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            name={title}
            connectNulls
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartBox>
  )
);

// 타입 선언 문제 해결을 위한 타입 정의
type SafeAny = any;

// 모달 컴포넌트 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(85vh - 130px);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 15px;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemButton = styled.button<{ active?: boolean }>`
  text-align: left;
  padding: 10px 15px;
  background-color: ${(props) => (props.active ? "#f0f7ff" : "white")};
  border: 1px solid ${(props) => (props.active ? "#4a90e2" : "#eee")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) => (props.active ? "#4a90e2" : "#333")};

  &:hover {
    background-color: ${(props) => (props.active ? "#e1f0ff" : "#f9f9f9")};
  }
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  background-color: ${(props) => (props.primary ? "#4a90e2" : "#f0f0f0")};
  color: ${(props) => (props.primary ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${(props) => (props.primary ? "#3a7bc5" : "#e0e0e0")};
  }
`;

// 아이템 선택기 컴포넌트
interface SelectorProps {
  items: string[];
  selectedItem: string;
  onSelect: (item: string) => void;
  title: string;
  placeholder: string;
}

const ItemSelector: React.FC<SelectorProps> = ({
  items,
  selectedItem,
  onSelect,
  title,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelected, setTempSelected] = useState(selectedItem);

  // 모달 바깥 클릭 시 닫기
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    setTempSelected(selectedItem);
    setSearchTerm("");
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSelect = (item: string) => {
    setTempSelected(item);
  };

  const confirmSelection = () => {
    onSelect(tempSelected);
    closeModal();
  };

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SelectorButton onClick={openModal}>
        <SelectedItemLabel>{selectedItem || placeholder}</SelectedItemLabel>
        <DropdownIcon>▼</DropdownIcon>
      </SelectorButton>

      {isOpen && (
        <ModalOverlay>
          <ModalContent ref={modalRef}>
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <ModalBody>
              <SearchInput
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              <ItemsList>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <ItemButton
                      key={item}
                      active={item === tempSelected}
                      onClick={() => handleSelect(item)}
                    >
                      {item}
                    </ItemButton>
                  ))
                ) : (
                  <div style={{ padding: "10px 0", color: "#666" }}>
                    검색 결과가 없습니다.
                  </div>
                )}
              </ItemsList>
            </ModalBody>

            <ModalFooter>
              <ModalButton onClick={closeModal}>취소</ModalButton>
              <ModalButton primary onClick={confirmSelection}>
                선택
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

const StatisticsPage: React.FC = () => {
  const userInfo = useSelector((state: SafeAny) => state.auth.userInfo);
  const navigate = useNavigate();

  // 상태 관리
  const [activeChart, setActiveChart] = useState<ChartType>("bodyLog");
  const [weekInterval, setWeekInterval] = useState<number>(2); // 주 단위 간격
  const [yearRange, setYearRange] = useState<number>(1); // 전체 조회 기간 (년)
  const [bodyLogs, setBodyLogs] = useState<BodyLogType[]>([]);
  const [workoutData, setWorkoutData] = useState<WorkoutSetType[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [availableBodyParts, setAvailableBodyParts] = useState<string[]>([]);

  // 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // 바디로그 데이터 로드
  const loadBodyLogs = useCallback(async () => {
    if (!userInfo) return;

    setIsLoading(true);
    try {
      const data = await getBodyLogsAPI();
      if (Array.isArray(data)) {
        // 날짜 기준으로 정렬
        const sortedData = [...data].sort(
          (a, b) =>
            new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
        );
        setBodyLogs(sortedData);
      } else {
        console.error("예상치 못한 API 응답 형식:", data);
        setBodyLogs([]);
      }
    } catch (error) {
      console.error("바디로그 이력 불러오기 실패:", error);
      setBodyLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  // 운동 데이터 로드
  const loadWorkoutData = useCallback(async () => {
    if (!userInfo) return;

    setIsLoading(true);
    try {
      // 실제 API 연동이 완료되면 아래 주석을 해제하고 더미 데이터 생성을 제거
      // const data = await getWorkoutRecordsAPI();
      const data = generateDummyWorkoutData();
      setWorkoutData(data);

      // 사용 가능한 운동 이름과 부위 목록 생성
      const exercises = [...new Set(data.map((item) => item.exerciseName))];
      const bodyParts = [...new Set(data.map((item) => item.bodyPart))];

      setAvailableExercises(exercises);
      setAvailableBodyParts(bodyParts);

      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0]);
      }

      if (bodyParts.length > 0 && !selectedBodyPart) {
        setSelectedBodyPart(bodyParts[0]);
      }
    } catch (error) {
      console.error("운동 기록 불러오기 실패:", error);
      setWorkoutData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, selectedExercise, selectedBodyPart]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (userInfo) {
      loadBodyLogs();
      loadWorkoutData();
    }
  }, [userInfo, loadBodyLogs, loadWorkoutData]);

  // 기간에 따른 데이터 필터링
  const getFilteredBodyLogs = useCallback(() => {
    const today = new Date();
    const endDate = today;
    const startDate = subDays(today, yearRange * 365); // yearRange년 전

    return bodyLogs.filter((log) => {
      const logDate = new Date(log.recordDate);
      return isWithinInterval(logDate, { start: startDate, end: endDate });
    });
  }, [bodyLogs, yearRange]);

  // 주 단위로 데이터 그룹화
  const getGroupedByWeek = useCallback(
    (data: any[], dateField: string) => {
      // 날짜별로 정렬
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
      );

      if (sortedData.length === 0) return [];

      // 주 단위로 그룹화
      const groupedData: { [key: string]: any[] } = {};
      const weekMsecs = weekInterval * 7 * 24 * 60 * 60 * 1000; // weekInterval 주 밀리초

      sortedData.forEach((item) => {
        const date = new Date(item[dateField]);
        const weekKey = Math.floor(date.getTime() / weekMsecs) * weekMsecs;
        const weekKeyStr = String(weekKey);

        if (!groupedData[weekKeyStr]) {
          groupedData[weekKeyStr] = [];
        }

        groupedData[weekKeyStr].push(item);
      });

      return Object.entries(groupedData).map(([weekKey, items]) => {
        const startDate = new Date(Number(weekKey));
        const endDate = new Date(Number(weekKey) + weekMsecs - 1);

        return {
          weekStart: startDate,
          weekEnd: endDate,
          items,
        };
      });
    },
    [weekInterval]
  );

  // 운동별 무게 변화 데이터 포맷팅
  const getExerciseWeightData = useCallback(() => {
    if (!selectedExercise) return [];

    const today = new Date();
    const startDate = subDays(today, yearRange * 365); // yearRange년 전

    // 기간 내 데이터만 필터링
    const filteredData = workoutData.filter((item) => {
      const itemDate = new Date(item.workoutDate);
      return (
        item.exerciseName === selectedExercise &&
        isWithinInterval(itemDate, { start: startDate, end: today })
      );
    });

    // 주 단위로 그룹화
    const groupedByWeek = getGroupedByWeek(filteredData, "workoutDate");

    // 주 단위 평균 계산
    return groupedByWeek.map((group) => {
      const allWeights: number[] = [];
      const allCounts: number[] = [];

      group.items.forEach((item) => {
        allWeights.push(item.weight);
        allCounts.push(item.counts);
      });

      const avgWeight =
        allWeights.length > 0
          ? +(
              allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length
            ).toFixed(1)
          : 0;

      const avgReps =
        allCounts.length > 0
          ? +(
              allCounts.reduce((sum, c) => sum + c, 0) / allCounts.length
            ).toFixed(1)
          : 0;

      return {
        date: `${format(group.weekStart, "MM/dd")}-${format(
          group.weekEnd,
          "MM/dd"
        )}`,
        weight: avgWeight,
        avgReps: avgReps,
      };
    });
  }, [workoutData, selectedExercise, yearRange, getGroupedByWeek]);

  // 부위별 볼륨 데이터 포맷팅
  const getBodyPartVolumeData = useCallback(() => {
    if (!selectedBodyPart) return [];

    const today = new Date();
    const startDate = subDays(today, yearRange * 365); // yearRange년 전

    // 기간 내 데이터만 필터링
    const filteredData = workoutData.filter((item) => {
      const itemDate = new Date(item.workoutDate);
      return (
        item.bodyPart === selectedBodyPart &&
        isWithinInterval(itemDate, { start: startDate, end: today })
      );
    });

    // 주 단위로 그룹화
    const groupedByWeek = getGroupedByWeek(filteredData, "workoutDate");

    // 주 단위 볼륨 계산
    return groupedByWeek.map((group) => {
      let totalVolume = 0;
      const exercises = new Set<string>();

      group.items.forEach((item) => {
        totalVolume += item.weight * item.counts;
        exercises.add(item.exerciseName);
      });

      return {
        date: `${format(group.weekStart, "MM/dd")}-${format(
          group.weekEnd,
          "MM/dd"
        )}`,
        volume: Math.round(totalVolume),
        exerciseCount: exercises.size,
      };
    });
  }, [workoutData, selectedBodyPart, yearRange, getGroupedByWeek]);

  // 차트 데이터 메모이제이션
  const filteredBodyLogData = useMemo(() => {
    const filteredData = getFilteredBodyLogs();

    // 주 단위로 그룹화
    const groupedByWeek = getGroupedByWeek(filteredData, "recordDate");

    // 주 단위 평균 계산
    return groupedByWeek.map((group) => {
      // 각 바디로그 항목에 대한 평균 계산
      const bodyWeights = group.items
        .map((item) => item.bodyWeight)
        .filter((val) => val !== null) as number[];

      const muscleMasses = group.items
        .map((item) => item.muscleMass)
        .filter((val) => val !== null) as number[];

      const bodyFats = group.items
        .map((item) => item.bodyFat)
        .filter((val) => val !== null) as number[];

      const avgBodyWeight =
        bodyWeights.length > 0
          ? +(
              bodyWeights.reduce((sum, w) => sum + w, 0) / bodyWeights.length
            ).toFixed(1)
          : null;

      const avgMuscleMass =
        muscleMasses.length > 0
          ? +(
              muscleMasses.reduce((sum, m) => sum + m, 0) / muscleMasses.length
            ).toFixed(1)
          : null;

      const avgBodyFat =
        bodyFats.length > 0
          ? +(
              bodyFats.reduce((sum, f) => sum + f, 0) / bodyFats.length
            ).toFixed(1)
          : null;

      return {
        date: `${format(group.weekStart, "MM/dd")}-${format(
          group.weekEnd,
          "MM/dd"
        )}`,
        bodyWeight: avgBodyWeight,
        muscleMass: avgMuscleMass,
        bodyFat: avgBodyFat,
      };
    });
  }, [getFilteredBodyLogs, getGroupedByWeek]);

  const exerciseWeightData = useMemo(
    () => getExerciseWeightData(),
    [getExerciseWeightData]
  );
  const bodyPartVolumeData = useMemo(
    () => getBodyPartVolumeData(),
    [getBodyPartVolumeData]
  );

  // 커스텀 포맷터 함수들
  const exerciseWeightFormatter = (value: ValueType, name: NameType) => {
    if (value == null) return ["데이터 없음", ""];
    if (name === "weight") return [`${value}kg`, name as string];
    if (name === "avgReps") return [`${value}회`, name as string];
    return [value, name as string];
  };

  const volumeFormatter = (value: ValueType, name: NameType) => {
    if (value == null) return ["데이터 없음", ""];
    if (name === "volume") return [`${value}kg`, name as string];
    if (name === "exerciseCount") return [`${value}개`, name as string];
    return [value, name as string];
  };

  // 차트 컴포넌트 렌더링
  const renderBodyLogCharts = useCallback(() => {
    if (filteredBodyLogData.length === 0) {
      return (
        <NoDataMessage>선택한 기간에 바디로그 데이터가 없습니다.</NoDataMessage>
      );
    }

    return (
      <div>
        <ChartBox>
          <ChartBoxTitle>체중 변화</ChartBoxTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={filteredBodyLogData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip formatter={bodyMetricTooltipFormatter("kg")} />
              <Legend />
              <Line
                type="monotone"
                dataKey="bodyWeight"
                stroke="#8884d8"
                name="체중"
                connectNulls
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox>
          <ChartBoxTitle>골격근량 변화</ChartBoxTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={filteredBodyLogData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip formatter={bodyMetricTooltipFormatter("kg")} />
              <Legend />
              <Line
                type="monotone"
                dataKey="muscleMass"
                stroke="#82ca9d"
                name="골격근량"
                connectNulls
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox>
          <ChartBoxTitle>체지방률 변화</ChartBoxTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={filteredBodyLogData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
              <Tooltip formatter={bodyMetricTooltipFormatter("%")} />
              <Legend />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="#ff8042"
                name="체지방률"
                connectNulls
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    );
  }, [filteredBodyLogData]);

  const renderExerciseWeightChart = useCallback(() => {
    if (exerciseWeightData.length === 0) {
      return (
        <NoDataMessage>선택한 운동에 대한 데이터가 없습니다.</NoDataMessage>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={exerciseWeightData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" domain={["dataMin - 5", "dataMax + 5"]} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 15]} />
          <Tooltip formatter={exerciseWeightFormatter} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="weight"
            stroke="#8884d8"
            name="무게"
            connectNulls
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgReps"
            stroke="#82ca9d"
            name="평균 횟수"
            connectNulls
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [exerciseWeightData]);

  const renderBodyPartVolumeChart = useCallback(() => {
    if (bodyPartVolumeData.length === 0) {
      return (
        <NoDataMessage>선택한 부위에 대한 데이터가 없습니다.</NoDataMessage>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={bodyPartVolumeData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={volumeFormatter} />
          <Legend />
          <Bar dataKey="volume" fill="#8884d8" name="볼륨" />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [bodyPartVolumeData]);

  // 주 간격 변경 핸들러
  const handleWeekIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWeekInterval(Math.min(52, Math.max(1, value)));
    }
  };

  // 전체 기간 변경 핸들러
  const handleYearRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setYearRange(Math.min(10, Math.max(1, value)));
    }
  };

  // 증가/감소 버튼 핸들러
  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    currentValue: number,
    max: number
  ) => {
    setter((prev) => Math.min(max, prev + 1));
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    currentValue: number,
    min: number
  ) => {
    setter((prev) => Math.max(min, prev - 1));
  };

  if (!userInfo) return null;

  return (
    <Container>
      <Title>운동 통계</Title>

      <ChartTypesContainer>
        <ButtonGroup>
          <Button
            active={activeChart === "bodyLog"}
            onClick={() => setActiveChart("bodyLog")}
          >
            바디로그 변화
          </Button>
          <Button
            active={activeChart === "exerciseWeight"}
            onClick={() => setActiveChart("exerciseWeight")}
          >
            운동별 무게 변화
          </Button>
          <Button
            active={activeChart === "bodyPartVolume"}
            onClick={() => setActiveChart("bodyPartVolume")}
          >
            부위별 볼륨
          </Button>
        </ButtonGroup>
      </ChartTypesContainer>

      <FiltersContainer>
        {(activeChart === "bodyLog" || activeChart === "exerciseWeight") && (
          <FilterSection className="compact">
            <FilterTitle>기간 설정</FilterTitle>
            <PeriodRow>
              <CompactInputLabel>조회:</CompactInputLabel>
              <CompactInputWrapper>
                <CompactInputButton
                  onClick={() => handleDecrement(setYearRange, yearRange, 1)}
                  type="button"
                >
                  -
                </CompactInputButton>
                <CompactInput
                  type="number"
                  min="1"
                  max="10"
                  value={yearRange}
                  onChange={handleYearRangeChange}
                />
                <CompactInputButton
                  onClick={() => handleIncrement(setYearRange, yearRange, 10)}
                  type="button"
                >
                  +
                </CompactInputButton>
              </CompactInputWrapper>
              <CompactUnitLabel>년</CompactUnitLabel>
            </PeriodRow>

            <PeriodRow style={{ marginTop: "8px" }}>
              <CompactInputLabel>간격:</CompactInputLabel>
              <CompactInputWrapper>
                <CompactInputButton
                  onClick={() =>
                    handleDecrement(setWeekInterval, weekInterval, 1)
                  }
                  type="button"
                >
                  -
                </CompactInputButton>
                <CompactInput
                  type="number"
                  min="1"
                  max="52"
                  value={weekInterval}
                  onChange={handleWeekIntervalChange}
                />
                <CompactInputButton
                  onClick={() =>
                    handleIncrement(setWeekInterval, weekInterval, 52)
                  }
                  type="button"
                >
                  +
                </CompactInputButton>
              </CompactInputWrapper>
              <CompactUnitLabel>주</CompactUnitLabel>
            </PeriodRow>
          </FilterSection>
        )}

        {activeChart === "exerciseWeight" && (
          <FilterSection>
            <FilterTitle>운동 선택</FilterTitle>
            <ItemSelector
              items={availableExercises}
              selectedItem={selectedExercise}
              onSelect={setSelectedExercise}
              title="운동 선택"
              placeholder="운동을 선택해주세요"
            />
          </FilterSection>
        )}

        {activeChart === "bodyPartVolume" && (
          <FilterSection>
            <FilterTitle>부위 선택</FilterTitle>
            <SelectContainer>
              <CompactSelect
                value={selectedBodyPart}
                onChange={(e) => setSelectedBodyPart(e.target.value)}
              >
                {availableBodyParts.map((bodyPart) => (
                  <option key={bodyPart} value={bodyPart}>
                    {bodyPart}
                  </option>
                ))}
              </CompactSelect>
              <SelectArrow />
            </SelectContainer>
          </FilterSection>
        )}
      </FiltersContainer>

      {isLoading ? (
        <LoadingIndicator>데이터 로딩 중...</LoadingIndicator>
      ) : (
        <GraphContainer>
          {activeChart === "bodyLog" && (
            <>
              <ChartTitle>
                바디로그 변화 (최근 {yearRange}년, {weekInterval}주 단위)
              </ChartTitle>
              {renderBodyLogCharts()}
            </>
          )}

          {activeChart === "exerciseWeight" && (
            <>
              <ChartTitle>
                {selectedExercise} 무게 변화 (최근 {yearRange}년, {weekInterval}
                주 단위)
              </ChartTitle>
              {renderExerciseWeightChart()}
            </>
          )}

          {activeChart === "bodyPartVolume" && (
            <>
              <ChartTitle>{selectedBodyPart} 부위 볼륨</ChartTitle>
              {renderBodyPartVolumeChart()}
            </>
          )}
        </GraphContainer>
      )}
    </Container>
  );
};

export default memo(StatisticsPage);
