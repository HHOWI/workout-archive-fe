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
import { format, isValid, getMonth, getYear } from "date-fns";
import { ko } from "date-fns/locale";
import { theme, fadeIn } from "../styles/theme";
import {
  FaTrashAlt,
  FaRulerVertical,
  FaWeight,
  FaDumbbell,
  FaPercentage,
  FaCalendarAlt,
  FaSave,
  FaHistory,
  FaExclamationCircle,
  FaChartLine,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// 타입 정의
interface BodyLogType {
  bodyLogSeq: number;
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

interface FormInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  icon: React.ReactNode;
  min: string;
  max: string;
  unit: string;
}

// 스타일 컴포넌트 - 공통 스타일
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #fff;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 16px 0;
  background: ${(props) => (props.active ? theme.primary : "white")};
  border: none;
  color: ${(props) => (props.active ? "white" : theme.text)};
  font-weight: ${(props) => (props.active ? "600" : "normal")};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;

  &:hover {
    background: ${(props) =>
      props.active ? theme.primary : "rgba(74, 144, 226, 0.1)"};
  }
`;

const FormWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.3s ease-out;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
  color: ${theme.text};
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Button = styled.button`
  background: ${theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${theme.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #bdbdbd;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  color: #757575;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  svg {
    font-size: 40px;
    color: #bdbdbd;
  }

  p {
    font-size: 16px;
    margin: 0;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #757575;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &::after {
    content: "";
    width: 30px;
    height: 30px;
    border: 3px solid #e0e0e0;
    border-top-color: ${theme.primary};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const GeneralError = styled.div`
  background-color: #ffebee;
  color: #e53935;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

// 월 선택기 스타일
const MonthPickerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const MonthDisplay = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.text};
  margin: 0 16px;
  width: 120px;
  text-align: center;
`;

const MonthButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: ${theme.primary};
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(74, 144, 226, 0.1);
  }

  &:active {
    background-color: rgba(74, 144, 226, 0.2);
  }
`;

// 유틸리티 함수
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) {
      return "날짜 정보 없음";
    }
    return format(date, "yyyy년 MM월 dd일");
  } catch (error) {
    return "날짜 정보 없음";
  }
};

// 월 선택기 컴포넌트
const MonthPicker: React.FC<{
  selectedMonth: Date;
  onChange: (date: Date) => void;
}> = ({ selectedMonth, onChange }) => {
  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate);
  };

  return (
    <MonthPickerContainer>
      <MonthButton onClick={handlePrevMonth}>
        <FaChevronLeft />
      </MonthButton>
      <MonthDisplay>
        {format(selectedMonth, "yyyy년 MM월", { locale: ko })}
      </MonthDisplay>
      <MonthButton onClick={handleNextMonth}>
        <FaChevronRight />
      </MonthButton>
    </MonthPickerContainer>
  );
};

// 폼 인풋 컴포넌트
const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  icon,
  min,
  max,
  unit,
}) => {
  const InputGroup = styled.div`
    position: relative;
    display: flex;
    align-items: center;
  `;

  const Input = styled.input`
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: ${theme.primary};
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }

    &::placeholder {
      color: #bdbdbd;
    }
  `;

  const InputUnit = styled.span`
    position: absolute;
    right: 12px;
    color: #9e9e9e;
    font-size: 14px;
    pointer-events: none;
  `;

  const IconWrapper = styled.span`
    position: absolute;
    left: 12px;
    color: #757575;
    font-size: 16px;
    pointer-events: none;
  `;

  const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${theme.text};
    font-size: 15px;
  `;

  const ErrorMessage = styled.div`
    color: #e53935;
    font-size: 13px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  return (
    <FormGroup>
      <Label>{label}</Label>
      <InputGroup>
        <IconWrapper>{icon}</IconWrapper>
        <Input
          type="number"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step="0.1"
          min={min}
          max={max}
        />
        <InputUnit>{unit}</InputUnit>
      </InputGroup>
      {error && (
        <ErrorMessage>
          <FaExclamationCircle />
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
};

// 날짜 선택기 컴포넌트
const DatePickerInput: React.FC<{
  date: Date;
  setDate: (date: Date) => void;
}> = ({ date, setDate }) => {
  const CustomDatePickerWrapper = styled.div`
    position: relative;
    .react-datepicker-wrapper {
      width: 100%;
    }

    .react-datepicker__input-container {
      display: flex;
      align-items: center;
    }

    .react-datepicker__input-container input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 15px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: ${theme.primary};
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }
    }

    .react-datepicker {
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      font-family: inherit;
    }

    .react-datepicker__header {
      background-color: ${theme.primary};
      border-bottom: none;
      padding-top: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .react-datepicker__current-month,
    .react-datepicker__day-name {
      color: white;
    }

    .react-datepicker__day--selected {
      background-color: ${theme.primary};
      border-radius: 50%;
    }

    .react-datepicker__day:hover {
      border-radius: 50%;
    }
  `;

  const DatePickerIconWrapper = styled.span`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #757575;
    font-size: 16px;
    z-index: 2;
    pointer-events: none;
  `;

  const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${theme.text};
    font-size: 15px;
  `;

  return (
    <FormGroup>
      <Label>측정 날짜</Label>
      <CustomDatePickerWrapper>
        <DatePickerIconWrapper>
          <FaCalendarAlt />
        </DatePickerIconWrapper>
        <DatePicker
          selected={date}
          onChange={(newDate: Date | null) => newDate && setDate(newDate)}
          dateFormat="yyyy-MM-dd"
          locale={ko}
          maxDate={new Date()}
        />
      </CustomDatePickerWrapper>
    </FormGroup>
  );
};

// 바디로그 입력 폼 컴포넌트
const BodyLogForm: React.FC<{
  date: Date;
  setDate: (date: Date) => void;
  height: string;
  weight: string;
  muscleMass: string;
  bodyFat: string;
  errors: FormErrors;
  isSubmitting: boolean;
  heightChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  weightChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  muscleMassChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  bodyFatChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
}> = ({
  date,
  setDate,
  height,
  weight,
  muscleMass,
  bodyFat,
  errors,
  isSubmitting,
  heightChangeHandler,
  weightChangeHandler,
  muscleMassChangeHandler,
  bodyFatChangeHandler,
  handleSubmit,
}) => (
  <FormWrapper>
    <FormTitle>신체 측정 기록</FormTitle>

    {errors.general && (
      <GeneralError>
        <FaExclamationCircle />
        {errors.general}
      </GeneralError>
    )}

    <DatePickerInput date={date} setDate={setDate} />

    <FormInput
      label="키 (cm)"
      value={height}
      onChange={heightChangeHandler}
      placeholder="예: 175.5"
      error={errors.height}
      icon={<FaRulerVertical />}
      min="0"
      max="300"
      unit="cm"
    />

    <FormInput
      label="체중 (kg)"
      value={weight}
      onChange={weightChangeHandler}
      placeholder="예: 65.5"
      error={errors.bodyWeight}
      icon={<FaWeight />}
      min="0"
      max="500"
      unit="kg"
    />

    <FormInput
      label="골격근량 (kg)"
      value={muscleMass}
      onChange={muscleMassChangeHandler}
      placeholder="예: 30.5"
      error={errors.muscleMass}
      icon={<FaDumbbell />}
      min="0"
      max="100"
      unit="kg"
    />

    <FormInput
      label="체지방률 (%)"
      value={bodyFat}
      onChange={bodyFatChangeHandler}
      placeholder="예: 15.5"
      error={errors.bodyFat}
      icon={<FaPercentage />}
      min="0"
      max="100"
      unit="%"
    />

    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? (
        "저장 중..."
      ) : (
        <>
          <FaSave />
          저장하기
        </>
      )}
    </Button>
  </FormWrapper>
);

// 바디로그 항목 컴포넌트
const BodyLogItem: React.FC<{
  log: BodyLogType;
  onDelete: (id: number) => void;
}> = ({ log, onDelete }) => {
  const HistoryItem = styled.div`
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
  `;

  const HistoryDate = styled.div`
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${theme.text};
    font-size: 16px;
  `;

  const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #e53935;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(229, 57, 53, 0.1);
    }
  `;

  const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 500px) {
      grid-template-columns: 1fr;
    }
  `;

  const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background-color: #f1f3f5;
    }
  `;

  const StatIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${theme.primary};
    color: white;
    font-size: 16px;
  `;

  const StatContent = styled.div`
    display: flex;
    flex-direction: column;
  `;

  const StatLabel = styled.span`
    color: #757575;
    font-size: 13px;
  `;

  const StatValue = styled.span`
    font-weight: 600;
    font-size: 16px;
    color: ${theme.text};
  `;

  return (
    <HistoryItem>
      <HistoryDate>
        <span>{formatDate(log.recordDate)}</span>
        <DeleteButton onClick={() => onDelete(log.bodyLogSeq)}>
          <FaTrashAlt />
          삭제
        </DeleteButton>
      </HistoryDate>
      <StatsContainer>
        {log.height !== null && (
          <StatItem>
            <StatIconWrapper>
              <FaRulerVertical />
            </StatIconWrapper>
            <StatContent>
              <StatLabel>키</StatLabel>
              <StatValue>{log.height.toFixed(1)} cm</StatValue>
            </StatContent>
          </StatItem>
        )}
        {log.bodyWeight !== null && (
          <StatItem>
            <StatIconWrapper>
              <FaWeight />
            </StatIconWrapper>
            <StatContent>
              <StatLabel>체중</StatLabel>
              <StatValue>{log.bodyWeight.toFixed(1)} kg</StatValue>
            </StatContent>
          </StatItem>
        )}
        {log.muscleMass !== null && (
          <StatItem>
            <StatIconWrapper>
              <FaDumbbell />
            </StatIconWrapper>
            <StatContent>
              <StatLabel>골격근량</StatLabel>
              <StatValue>{log.muscleMass.toFixed(1)} kg</StatValue>
            </StatContent>
          </StatItem>
        )}
        {log.bodyFat !== null && (
          <StatItem>
            <StatIconWrapper>
              <FaPercentage />
            </StatIconWrapper>
            <StatContent>
              <StatLabel>체지방률</StatLabel>
              <StatValue>{log.bodyFat.toFixed(1)} %</StatValue>
            </StatContent>
          </StatItem>
        )}
      </StatsContainer>
    </HistoryItem>
  );
};

// 바디로그 이력 컴포넌트
const BodyLogHistory: React.FC<{
  isLoading: boolean;
  bodyLogs: BodyLogType[];
  handleDelete: (id: number) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}> = ({ isLoading, bodyLogs, handleDelete, selectedMonth, onMonthChange }) => {
  const HistoryContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: ${fadeIn} 0.3s ease-out;
  `;

  if (isLoading) {
    return <LoadingIndicator>바디로그를 불러오는 중입니다</LoadingIndicator>;
  }

  return (
    <>
      <MonthPicker selectedMonth={selectedMonth} onChange={onMonthChange} />

      {bodyLogs.length === 0 ? (
        <NoData>
          <FaInfoCircle />
          <p>
            {format(selectedMonth, "yyyy년 MM월", { locale: ko })}에 기록된 측정
            이력이 없습니다.
          </p>
          <p>새로운 바디로그를 등록해보세요!</p>
        </NoData>
      ) : (
        <HistoryContainer>
          {bodyLogs.map((log) => (
            <BodyLogItem
              key={log.bodyLogSeq}
              log={log}
              onDelete={handleDelete}
            />
          ))}
        </HistoryContainer>
      )}
    </>
  );
};

// 메인 컴포넌트
const BodyLogPage: React.FC = () => {
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"input" | "history">("input");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

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
  const loadBodyLogs = useCallback(
    async (month?: Date) => {
      if (!userInfo) return;

      setIsLoading(true);
      try {
        const targetMonth = month || selectedMonth;
        const yearMonth = format(targetMonth, "yyyy-MM");
        const data = await getBodyLogsAPI({ yearMonth });

        if (Array.isArray(data)) {
          setBodyLogs(data);
        } else {
          setBodyLogs([]);
        }
      } catch (error) {
        setBodyLogs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userInfo, selectedMonth]
  );

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
        // 에러 처리를 필요에 따라 구현
      }
    }
  }, [userInfo]);

  // 월 변경 핸들러
  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      setSelectedMonth(newMonth);
      loadBodyLogs(newMonth);
    },
    [loadBodyLogs]
  );

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

      // 입력 날짜의 월이 현재 선택된 월과 같다면 이력 새로고침
      const inputMonth = getMonth(date);
      const inputYear = getYear(date);
      const selectedMonthValue = getMonth(selectedMonth);
      const selectedYearValue = getYear(selectedMonth);

      if (
        inputMonth === selectedMonthValue &&
        inputYear === selectedYearValue
      ) {
        await loadBodyLogs();
      }

      // 입력 탭에서 이력 탭으로 전환
      setActiveTab("history");

      // 입력된 날짜의 월을 선택
      if (
        inputMonth !== selectedMonthValue ||
        inputYear !== selectedYearValue
      ) {
        const newSelectedMonth = new Date(date);
        setSelectedMonth(newSelectedMonth);
        await loadBodyLogs(newSelectedMonth);
      }
    } catch (error: any) {
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
  }, [
    validateInputs,
    height,
    weight,
    muscleMass,
    bodyFat,
    date,
    loadBodyLogs,
    selectedMonth,
  ]);

  // 바디로그 삭제 핸들러
  const handleDelete = useCallback(
    async (bodyLogSeq: number) => {
      if (!window.confirm("정말 이 기록을 삭제하시겠습니까?")) {
        return;
      }

      try {
        await deleteBodyLogAPI(bodyLogSeq);
        alert("바디로그가 삭제되었습니다.");
        await loadBodyLogs();
      } catch (error) {
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
          <FaChartLine />
          측정값 입력
        </Tab>
        <Tab
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory />
          측정 이력
        </Tab>
      </TabsContainer>

      {activeTab === "input" ? (
        <BodyLogForm
          date={date}
          setDate={setDate}
          height={height}
          weight={weight}
          muscleMass={muscleMass}
          bodyFat={bodyFat}
          errors={errors}
          isSubmitting={isSubmitting}
          heightChangeHandler={heightChangeHandler}
          weightChangeHandler={weightChangeHandler}
          muscleMassChangeHandler={muscleMassChangeHandler}
          bodyFatChangeHandler={bodyFatChangeHandler}
          handleSubmit={handleSubmit}
        />
      ) : (
        <BodyLogHistory
          isLoading={isLoading}
          bodyLogs={bodyLogs}
          handleDelete={handleDelete}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      )}
    </Container>
  );
};

export default React.memo(BodyLogPage);
