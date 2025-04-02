import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Card,
  CardBody,
  TwoColumnGrid,
  Label,
  DatePickerWrapper,
  SelectedLocation,
  LocationInfo,
  LocationName,
  LocationAddress,
  RemoveButton,
  LocationButton,
} from "../../styles/WorkoutRecordStyles";
import { WorkoutPlaceDTO } from "../../dtos/WorkoutDTO";

interface DateExerciseSectionProps {
  date: Date;
  onDateChange: (date: Date | null) => void;
  selectedLocation: WorkoutPlaceDTO | null;
  onLocationSelect: (place: any) => void;
  onLocationRemove: () => void;
  onOpenLocationModal: () => void;
}

const DateExerciseSection: React.FC<DateExerciseSectionProps> = ({
  date,
  onDateChange,
  selectedLocation,
  onLocationRemove,
  onOpenLocationModal,
}) => {
  return (
    <Card>
      <CardBody>
        <TwoColumnGrid>
          <div>
            <Label>운동 날짜</Label>
            <DatePickerWrapper>
              <DatePicker
                selected={date}
                onChange={onDateChange}
                dateFormat="yyyy-MM-dd"
                className="custom-datepicker"
              />
            </DatePickerWrapper>
          </div>

          <div>
            <Label>운동 장소 (선택사항)</Label>
            {selectedLocation ? (
              <SelectedLocation>
                <LocationInfo>
                  <LocationName>{selectedLocation.placeName}</LocationName>
                  <LocationAddress>
                    {selectedLocation.roadAddressName ||
                      selectedLocation.addressName ||
                      selectedLocation.placeAddress ||
                      ""}
                  </LocationAddress>
                </LocationInfo>
                <RemoveButton onClick={onLocationRemove}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </RemoveButton>
              </SelectedLocation>
            ) : (
              <LocationButton onClick={onOpenLocationModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                장소 선택하기
              </LocationButton>
            )}
          </div>
        </TwoColumnGrid>
      </CardBody>
    </Card>
  );
};

export default DateExerciseSection;
