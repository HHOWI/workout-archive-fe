import styled from "@emotion/styled";

// 색상 테마 상수화
export const COLORS = {
  primary: "#4a90e2",
  primaryDark: "#2a6bba",
  primaryLight: "#e8f2ff",
  primaryHover: "#357ac5",
  secondary: "#f8f9fa",
  secondaryHover: "#e9ecef",
  border: "#dde2e8",
  borderDark: "#c6ccd4",
  text: "#333333",
  textSecondary: "#6c757d",
  textLight: "#adb5bd",
  danger: "#dc3545",
  dangerHover: "#c82333",
  background: "#ffffff",
  cardBackground: "#ffffff",
  success: "#28a745",
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
};

// 간격 및 크기 상수화
export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
};

export const BORDER_RADIUS = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  round: "50%",
};

// 전체 레이아웃 관련 반응형 스타일 적용
export const minimumFormsWidth = "680px";

// 메인 컨테이너
export const Container = styled.div`
  max-width: 1000px;
  width: 95%;
  margin: 0 auto;
  padding: ${SPACING.lg} ${SPACING.md};
  color: ${COLORS.text};
`;

// 카드 스타일 컴포넌트
export const Card = styled.div`
  background-color: ${COLORS.cardBackground};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px ${COLORS.shadowLight};
  margin-bottom: ${SPACING.lg};
  overflow: hidden;
`;

// 카드 헤더
export const CardHeader = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${SPACING.sm};

  @media (max-width: ${minimumFormsWidth}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// 카드 내용
export const CardBody = styled.div`
  padding: ${SPACING.lg};
`;

// 카드 제목
export const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${COLORS.text};
`;

// 카드 푸터
export const CardFooter = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-top: 1px solid ${COLORS.border};
  background-color: ${COLORS.secondary};
`;

// 폼 레이블
export const Label = styled.label`
  display: block;
  margin-bottom: ${SPACING.sm};
  font-weight: 600;
  font-size: 15px;
  color: ${COLORS.text};
`;

// 날짜, 장소 선택 그리드 레이아웃
export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 8.5fr;
  gap: ${SPACING.xl};

  @media (max-width: ${minimumFormsWidth}) {
    grid-template-columns: 1fr;
    gap: ${SPACING.md};
  }
`;

// 입력 필드 공통 스타일
export const inputBaseStyles = `
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: ${COLORS.text};
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
  }
  
  &:hover {
    border-color: ${COLORS.borderDark};
  }
`;

// 위치 관련 스타일
export const LocationButton = styled.button`
  ${inputBaseStyles}
  display: flex;
  align-items: center;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  text-align: left;

  svg {
    margin-right: ${SPACING.sm};
    color: ${COLORS.primary};
    flex-shrink: 0;
  }

  &:hover,
  &:focus {
    border-color: ${COLORS.borderDark};
    background-color: ${COLORS.secondaryHover};
  }
`;

export const SelectedLocation = styled.div`
  ${inputBaseStyles}
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: auto;
  min-height: 40px;
  padding: 4px 12px;

  &:hover {
    border-color: ${COLORS.borderDark};
  }
`;

export const LocationInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

export const LocationName = styled.div`
  font-weight: 600;
  color: ${COLORS.text};
  white-space: nowrap;
`;

export const LocationAddress = styled.div`
  font-size: 13px;
  color: ${COLORS.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  color: ${COLORS.danger};
  border: none;
  cursor: pointer;
  padding: ${SPACING.xs};
  margin-left: ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.sm};
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

// 운동 관련 스타일
export const AddExerciseButton = styled.button`
  width: 100%;
  padding: ${SPACING.md};
  margin-top: ${SPACING.md};
  background-color: ${COLORS.secondary};
  color: ${COLORS.textSecondary};
  border: 1px dashed ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLORS.secondaryHover};
    border-color: ${COLORS.borderDark};
    color: ${COLORS.text};
  }
`;

export const DraggableExercise = styled.div<{ isDragging?: boolean }>`
  margin-bottom: ${SPACING.md};
  opacity: ${(props) => (props.isDragging ? "0.5" : "1")};
  cursor: grab;
  border-radius: ${BORDER_RADIUS.md};
  overflow: hidden;
  box-shadow: 0 2px 6px ${COLORS.shadowLight};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${COLORS.shadow};
  }

  &:active {
    cursor: grabbing;
  }
`;

// 사진 및 일기 관련 스타일
export const PhotoDiaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background-color: ${COLORS.cardBackground};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 8px ${COLORS.shadowLight};
  overflow: hidden;
  margin-bottom: ${SPACING.lg};

  @media (max-width: ${minimumFormsWidth}) {
    grid-template-columns: 1fr;
  }
`;

export const PhotoSection = styled.div`
  padding: ${SPACING.lg};
  border-right: 1px solid ${COLORS.border};

  @media (max-width: ${minimumFormsWidth}) {
    border-right: none;
    border-bottom: 1px solid ${COLORS.border};
  }
`;

export const DiarySection = styled.div`
  padding: ${SPACING.lg};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const PhotoUploadContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const PhotoPreviewArea = styled.div<{ hasPhoto: boolean }>`
  flex: 1;
  min-height: 280px;
  border: ${(props) =>
    props.hasPhoto ? "none" : `2px dashed ${COLORS.border}`};
  border-radius: ${BORDER_RADIUS.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md};
  overflow: hidden;
  position: relative;
  cursor: ${(props) => (props.hasPhoto ? "default" : "pointer")};
  background-color: ${(props) =>
    props.hasPhoto ? "transparent" : COLORS.secondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.hasPhoto ? "transparent" : COLORS.secondaryHover};
    border-color: ${(props) => (props.hasPhoto ? "none" : COLORS.borderDark)};
  }
`;

export const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${SPACING.md};
  color: ${COLORS.textSecondary};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${SPACING.md};
    color: ${COLORS.textLight};
  }

  p {
    margin: 0;
    font-size: 15px;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const PhotoRemoveButton = styled.button`
  background-color: ${COLORS.background};
  color: ${COLORS.danger};
  border: 1px solid ${COLORS.danger};
  border-radius: ${BORDER_RADIUS.md};
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

export const DiaryTextarea = styled.textarea`
  width: 100%;
  min-height: 280px;
  padding: 12px 16px;
  font-size: 15px;
  font-family: inherit;
  color: ${COLORS.text};
  background-color: ${COLORS.background};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  resize: vertical;
  line-height: 1.6;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primaryLight};
  }

  &:hover:not(:focus) {
    border-color: ${COLORS.borderDark};
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

// 모달 관련 스타일
export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: ${SPACING.md};
`;

export const ModalContent = styled.div`
  background-color: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

  @media (max-width: ${minimumFormsWidth}) {
    width: 100%;
    max-height: 90vh;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${COLORS.secondary};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c9d6;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8b2c1;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  position: sticky;
  top: 0;
  background-color: ${COLORS.background};
  z-index: 1;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${COLORS.text};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${COLORS.text};
  }
`;

export const ModalBody = styled.div`
  padding: ${SPACING.lg};
`;

// DatePicker 스타일용
export const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    display: block;
    width: 100%;
  }

  .react-datepicker__input-container input {
    ${inputBaseStyles}
  }
`;

// 유틸리티 스타일
export const Message = styled.div`
  text-align: center;
  padding: ${SPACING.lg} ${SPACING.md};
  color: ${COLORS.textSecondary};
  font-size: 15px;
`;

// 저장 버튼
export const SaveButton = styled.button`
  width: 100%;
  padding: ${SPACING.md};
  background-color: ${COLORS.primary};
  color: white;
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    background-color: ${COLORS.primaryHover};
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }

  &:disabled {
    background-color: ${COLORS.textLight};
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// 최근 운동 관련 스타일
export const RecentWorkoutsButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  padding: 10px 16px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: ${minimumFormsWidth}) {
    width: 100%;
    justify-content: center;
    margin-top: ${SPACING.xs};
  }

  svg {
    color: ${COLORS.primary};
  }

  &:hover {
    background-color: ${COLORS.secondaryHover};
    border-color: ${COLORS.borderDark};
  }
`;

export const RecentWorkoutsList = styled.div`
  margin-top: ${SPACING.md};
`;

export const RecentWorkoutItem = styled.div`
  padding: ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.md};
  margin-bottom: ${SPACING.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${COLORS.secondary};
    border-color: ${COLORS.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${COLORS.shadowLight};
  }
`;

export const WorkoutDate = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${COLORS.text};
  margin-bottom: ${SPACING.sm};
`;

export const WorkoutInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
  margin-bottom: ${SPACING.sm};
  font-size: 14px;
  color: ${COLORS.textSecondary};
`;

export const WorkoutIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${COLORS.primary};
`;

export const WorkoutExercises = styled.div`
  margin-top: ${SPACING.sm};
  padding-top: ${SPACING.sm};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.xs};
`;

export const ExerciseTag = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  background-color: ${COLORS.secondary};
  color: ${COLORS.text};
  padding: 4px 10px;
  border-radius: 12px;
  margin: 2px;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${COLORS.primary};
    margin-right: 6px;
  }
`;
