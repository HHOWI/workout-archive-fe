import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  saveBodyLogAPI,
  getBodyLogsAPI,
  getLatestBodyLogAPI,
  deleteBodyLogAPI,
} from "../api/bodyLog";
import { format, isValid } from "date-fns";
import { ko } from "date-fns/locale";

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 5px;
`;

const Button = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;

  &:hover {
    background: #357ac5;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const CustomDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  max-width: 800px;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 15px 0;
  background: none;
  border: none;
  border-bottom: ${(props) => (props.active ? "2px solid #4a90e2" : "none")};
  color: ${(props) => (props.active ? "#4a90e2" : "#333")};
  font-weight: ${(props) => (props.active ? "600" : "normal")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #4a90e2;
  }
`;

const HistoryContainer = styled.div`
  margin-top: 30px;
`;

const HistoryItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HistoryDate = styled.div`
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff3b30;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span`
  font-weight: 600;
`;

const NoData = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

interface BodyLogType {
  userInfoRecordSeq: number;
  height: number | null;
  bodyWeight: number | null;
  muscleMass: number | null;
  bodyFat: number | null;
  recordDate: string;
}

interface FormErrors {
  height?: string;
  bodyWeight?: string;
  muscleMass?: string;
  bodyFat?: string;
  general?: string;
}

// 날짜 포맷 함수를 안전하게 만듦
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return "날짜 정보 없음";
    }
    return format(date, "yyyy년 MM월 dd일");
  } catch (error) {
    console.error("날짜 포맷 오류:", error);
    return "날짜 정보 없음";
  }
};

const BodyLogPage: React.FC = () => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"input" | "history">("input");

  // 폼 상태
  const [date, setDate] = useState<Date>(new Date());
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [muscleMass, setMuscleMass] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 바디로그 이력
  const [bodyLogs, setBodyLogs] = useState<BodyLogType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 비로그인 상태일 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  // 에러 초기화 함수
  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // 바디로그 이력 불러오기
  const loadBodyLogs = useCallback(async () => {
    if (!userInfo) return;

    setIsLoading(true);
    try {
      const data = await getBodyLogsAPI();
      if (Array.isArray(data)) {
        setBodyLogs(data);
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

  // 최근 바디로그 불러오기
  const loadLatestBodyLog = useCallback(async () => {
    if (!userInfo) return;

    try {
      const data = await getLatestBodyLogAPI();
      if (data) {
        setHeight(data.height?.toString() || "");
        setWeight(data.bodyWeight?.toString() || "");
        setMuscleMass(data.muscleMass?.toString() || "");
        setBodyFat(data.bodyFat?.toString() || "");
      }
    } catch (error) {
      // 최근 바디로그가 없는 경우는 에러가 아님
      if ((error as any)?.response?.status !== 404) {
        console.error("최근 바디로그 불러오기 실패:", error);
      }
    }
  }, [userInfo]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (userInfo) {
      loadLatestBodyLog();
      loadBodyLogs();
    }
  }, [userInfo, loadLatestBodyLog, loadBodyLogs]);

  // 입력값 유효성 검사
  const validateInputs = useCallback(() => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 모든 필드가 비어있는지 확인
    if (!height && !weight && !muscleMass && !bodyFat) {
      newErrors.general = "최소한 하나의 측정값은 입력해야 합니다.";
      isValid = false;
    }

    // 키 유효성 검사
    if (height) {
      const heightValue = parseFloat(height);
      if (isNaN(heightValue) || heightValue <= 0 || heightValue > 300) {
        newErrors.height = "키는 0보다 크고 300cm 이하의 값이어야 합니다.";
        isValid = false;
      }
    }

    // 체중 유효성 검사
    if (weight) {
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
        newErrors.bodyWeight =
          "체중은 0보다 크고 500kg 이하의 값이어야 합니다.";
        isValid = false;
      }
    }

    // 골격근량 유효성 검사
    if (muscleMass) {
      const muscleMassValue = parseFloat(muscleMass);
      if (
        isNaN(muscleMassValue) ||
        muscleMassValue <= 0 ||
        muscleMassValue > 100
      ) {
        newErrors.muscleMass =
          "골격근량은 0보다 크고 100kg 이하의 값이어야 합니다.";
        isValid = false;
      }
    }

    // 체지방률 유효성 검사
    if (bodyFat) {
      const bodyFatValue = parseFloat(bodyFat);
      if (isNaN(bodyFatValue) || bodyFatValue < 0 || bodyFatValue > 100) {
        newErrors.bodyFat = "체지방률은 0 이상 100% 이하의 값이어야 합니다.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [height, weight, muscleMass, bodyFat]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await saveBodyLogAPI({
        height: height ? parseFloat(height) : null,
        bodyWeight: weight ? parseFloat(weight) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        recordDate: date.toISOString(),
      });

      alert("바디로그가 성공적으로 저장되었습니다!");
      // 이력 새로고침
      await loadBodyLogs();
      // 입력 탭에서 이력 탭으로 전환
      setActiveTab("history");
    } catch (error: any) {
      console.error("바디로그 저장 실패:", error);
      const errorMessage =
        error.response?.data?.message ||
        "바디로그 저장에 실패했습니다. 다시 시도해주세요.";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [validateInputs, height, weight, muscleMass, bodyFat, date, loadBodyLogs]);

  // 바디로그 삭제 핸들러
  const handleDelete = useCallback(
    async (userInfoRecordSeq: number) => {
      if (!window.confirm("정말 이 기록을 삭제하시겠습니까?")) {
        return;
      }

      try {
        await deleteBodyLogAPI(userInfoRecordSeq);
        alert("바디로그가 삭제되었습니다.");
        // 이력 새로고침
        await loadBodyLogs();
      } catch (error) {
        console.error("바디로그 삭제 실패:", error);
        alert("바디로그 삭제에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [loadBodyLogs]
  );

  // 인풋 체인지 핸들러 생성 함수
  const createInputChangeHandler = useCallback(
    (
        setter: React.Dispatch<React.SetStateAction<string>>,
        errorField: keyof FormErrors
      ) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        clearFieldError(errorField);
      },
    [clearFieldError]
  );

  // 메모이즈된 핸들러들
  const heightChangeHandler = useMemo(
    () => createInputChangeHandler(setHeight, "height"),
    [createInputChangeHandler]
  );

  const weightChangeHandler = useMemo(
    () => createInputChangeHandler(setWeight, "bodyWeight"),
    [createInputChangeHandler]
  );

  const muscleMassChangeHandler = useMemo(
    () => createInputChangeHandler(setMuscleMass, "muscleMass"),
    [createInputChangeHandler]
  );

  const bodyFatChangeHandler = useMemo(
    () => createInputChangeHandler(setBodyFat, "bodyFat"),
    [createInputChangeHandler]
  );

  if (!userInfo) return null;

  return (
    <Container>
      <TabsContainer>
        <Tab
          active={activeTab === "input"}
          onClick={() => setActiveTab("input")}
        >
          측정값 입력
        </Tab>
        <Tab
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          측정 이력
        </Tab>
      </TabsContainer>

      {activeTab === "input" ? (
        <>
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <FormGroup>
            <Label>측정 날짜</Label>
            <CustomDatePickerWrapper>
              <DatePicker
                selected={date}
                onChange={(newDate: Date | null) => newDate && setDate(newDate)}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                maxDate={new Date()}
              />
            </CustomDatePickerWrapper>
          </FormGroup>

          <FormGroup>
            <Label>키 (cm)</Label>
            <Input
              type="number"
              value={height}
              onChange={heightChangeHandler}
              placeholder="예: 175.5"
              step="0.1"
              min="0"
              max="300"
            />
            {errors.height && <ErrorMessage>{errors.height}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>체중 (kg)</Label>
            <Input
              type="number"
              value={weight}
              onChange={weightChangeHandler}
              placeholder="예: 65.5"
              step="0.1"
              min="0"
              max="500"
            />
            {errors.bodyWeight && (
              <ErrorMessage>{errors.bodyWeight}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>골격근량 (kg)</Label>
            <Input
              type="number"
              value={muscleMass}
              onChange={muscleMassChangeHandler}
              placeholder="예: 30.5"
              step="0.1"
              min="0"
              max="100"
            />
            {errors.muscleMass && (
              <ErrorMessage>{errors.muscleMass}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>체지방률 (%)</Label>
            <Input
              type="number"
              value={bodyFat}
              onChange={bodyFatChangeHandler}
              placeholder="예: 15.5"
              step="0.1"
              min="0"
              max="100"
            />
            {errors.bodyFat && <ErrorMessage>{errors.bodyFat}</ErrorMessage>}
          </FormGroup>

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </>
      ) : (
        <HistoryContainer>
          {isLoading ? (
            <LoadingIndicator>로딩 중...</LoadingIndicator>
          ) : bodyLogs.length === 0 ? (
            <NoData>측정 이력이 없습니다.</NoData>
          ) : (
            bodyLogs.map((log) => (
              <HistoryItem key={log.userInfoRecordSeq}>
                <HistoryDate>
                  <span>{formatDate(log.recordDate)}</span>
                  <DeleteButton
                    onClick={() => handleDelete(log.userInfoRecordSeq)}
                  >
                    삭제
                  </DeleteButton>
                </HistoryDate>
                <StatsContainer>
                  {log.height !== null && (
                    <StatItem>
                      <StatLabel>키</StatLabel>
                      <StatValue>{log.height.toFixed(1)} cm</StatValue>
                    </StatItem>
                  )}
                  {log.bodyWeight !== null && (
                    <StatItem>
                      <StatLabel>체중</StatLabel>
                      <StatValue>{log.bodyWeight.toFixed(1)} kg</StatValue>
                    </StatItem>
                  )}
                  {log.muscleMass !== null && (
                    <StatItem>
                      <StatLabel>골격근량</StatLabel>
                      <StatValue>{log.muscleMass.toFixed(1)} kg</StatValue>
                    </StatItem>
                  )}
                  {log.bodyFat !== null && (
                    <StatItem>
                      <StatLabel>체지방률</StatLabel>
                      <StatValue>{log.bodyFat.toFixed(1)} %</StatValue>
                    </StatItem>
                  )}
                </StatsContainer>
              </HistoryItem>
            ))
          )}
        </HistoryContainer>
      )}
    </Container>
  );
};

export default React.memo(BodyLogPage);
