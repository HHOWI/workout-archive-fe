import React, { useRef, useCallback } from "react";
import {
  PhotoDiaryGrid,
  PhotoSection,
  DiarySection,
  PhotoUploadContainer,
  PhotoPreviewArea,
  PreviewImage,
  UploadPlaceholder,
  FileInput,
  PhotoRemoveButton,
  Label,
  DiaryTextarea,
} from "../../styles/WorkoutRecordStyles";

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

interface PhotoDiarySectionProps {
  photoPreview: string | null;
  setPhotoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPhoto: File | null;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<File | null>>;
  diaryText: string;
  onDiaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PhotoDiarySection: React.FC<PhotoDiarySectionProps> = ({
  photoPreview,
  setPhotoPreview,
  selectedPhoto,
  setSelectedPhoto,
  diaryText,
  onDiaryChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setSelectedPhoto(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setSelectedPhoto, setPhotoPreview]
  );

  const handleRemovePhoto = useCallback(() => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setSelectedPhoto, setPhotoPreview]);

  const handlePhotoContainerClick = useCallback(() => {
    if (!photoPreview) {
      fileInputRef.current?.click();
    }
  }, [photoPreview]);

  return (
    <PhotoDiaryGrid>
      <PhotoSection>
        <PhotoUploadContainer>
          <Label>운동 사진 (선택사항)</Label>
          <PhotoPreviewArea
            hasPhoto={!!photoPreview}
            onClick={photoPreview ? undefined : handlePhotoContainerClick}
          >
            {photoPreview ? (
              <PreviewImage src={photoPreview} alt="운동 사진 미리보기" />
            ) : (
              <UploadPlaceholder>
                <ImageIcon />
                <p>사진을 업로드하려면 클릭하세요</p>
              </UploadPlaceholder>
            )}
          </PhotoPreviewArea>

          <FileInput
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            ref={fileInputRef}
          />

          {photoPreview && (
            <PhotoRemoveButton onClick={handleRemovePhoto}>
              사진 제거
            </PhotoRemoveButton>
          )}
        </PhotoUploadContainer>
      </PhotoSection>

      <DiarySection>
        <Label>오늘의 운동 일기 (선택사항)</Label>
        <DiaryTextarea
          placeholder="오늘 운동에 대한 생각이나 느낌을 기록해보세요."
          value={diaryText}
          onChange={onDiaryChange}
          spellCheck="false"
        />
      </DiarySection>
    </PhotoDiaryGrid>
  );
};

export default PhotoDiarySection;
