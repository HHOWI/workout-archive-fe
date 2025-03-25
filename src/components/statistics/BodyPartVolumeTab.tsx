import React, { useState } from "react";
import styled from "@emotion/styled";
import { FormControl, Select, MenuItem, InputLabel } from "@mui/material";

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

// 임시 운동 부위 목록
const bodyPartOptions = [
  { value: "chest", label: "가슴" },
  { value: "back", label: "등" },
  { value: "legs", label: "하체" },
  { value: "shoulders", label: "어깨" },
  { value: "arms", label: "팔" },
];

interface BodyPartVolumeTabProps {
  // 필요한 props 정의
}

const BodyPartVolumeTab: React.FC<BodyPartVolumeTabProps> = () => {
  // 상태 관리
  const [period, setPeriod] = useState("1year");
  const [interval, setInterval] = useState("1week");
  const [bodyPart, setBodyPart] = useState("chest");

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

      <ChartContainer>
        <ChartTitle>
          {bodyPartOptions.find((bp) => bp.value === bodyPart)?.label || ""}
          부위 운동 볼륨 변화
        </ChartTitle>
        <ChartPlaceholder>
          {bodyPartOptions.find((bp) => bp.value === bodyPart)?.label || ""}
          부위의 운동 볼륨 변화 막대 그래프가 여기에 표시됩니다
        </ChartPlaceholder>
      </ChartContainer>
    </Container>
  );
};

export default BodyPartVolumeTab;
