import React from "react";
import { SaveButton } from "../../styles/WorkoutRecordStyles";

interface SaveButtonSectionProps {
  isSubmitting: boolean;
  isButtonEnabled: boolean;
  onSubmit: () => void;
}

const SaveButtonSection: React.FC<SaveButtonSectionProps> = ({
  isSubmitting,
  isButtonEnabled,
  onSubmit,
}) => {
  return (
    <SaveButton disabled={isSubmitting || !isButtonEnabled} onClick={onSubmit}>
      {isSubmitting ? "저장 중..." : "기록 저장하기"}
    </SaveButton>
  );
};

export default SaveButtonSection;
