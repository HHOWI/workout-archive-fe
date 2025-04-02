import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
} from "../../styles/WorkoutRecordStyles";
import KakaoMapPlaceSelector from "../KakaoMapPlaceSelector";

interface LocationSelectorModalProps {
  onPlaceSelect: (place: any) => void;
  onClose: () => void;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  onPlaceSelect,
  onClose,
}) => {
  // 장소 선택 후 모달을 닫는 핸들러
  const handlePlaceSelect = (place: any) => {
    onPlaceSelect(place);
    onClose(); // 장소 선택 후 모달 닫기
  };

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>운동 장소 선택</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalBody>
          <KakaoMapPlaceSelector onPlaceSelect={handlePlaceSelect} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LocationSelectorModal;
