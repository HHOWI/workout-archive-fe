import React, { useState } from "react";
import styled from "@emotion/styled";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
} from "@mui/material";

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

// 임시 운동 목록 데이터
const exerciseOptions = [
  { value: 1, label: "벤치 프레스" },
  { value: 2, label: "스쿼트" },
  { value: 3, label: "데드리프트" },
  { value: 4, label: "숄더 프레스" },
  { value: 5, label: "바벨 로우" },
];

interface ExerciseWeightTabProps {
  // 필요한 props 정의
}

const ExerciseWeightTab: React.FC<ExerciseWeightTabProps> = () => {
  // 상태 관리
  const [period, setPeriod] = useState("1year");
  const [interval, setInterval] = useState("1week");
  const [selectedExercises, setSelectedExercises] = useState<
    typeof exerciseOptions
  >([]);

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

        <Autocomplete
          multiple
          id="exercise-selector"
          options={exerciseOptions}
          getOptionLabel={(option) => option.label}
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="운동 선택"
              variant="outlined"
              size="small"
            />
          )}
          onChange={(_, newValue) => setSelectedExercises(newValue)}
          value={selectedExercises}
        />
      </FiltersContainer>

      <ChartContainer>
        <ChartTitle>운동별 무게 변화</ChartTitle>
        {selectedExercises.length === 0 ? (
          <ChartPlaceholder>
            운동을 선택하여 무게 변화 추이를 확인하세요
          </ChartPlaceholder>
        ) : (
          <ChartPlaceholder>
            {selectedExercises.map((ex) => ex.label).join(", ")}의 무게 변화
            차트가 여기에 표시됩니다
          </ChartPlaceholder>
        )}
      </ChartContainer>
    </Container>
  );
};

export default ExerciseWeightTab;
