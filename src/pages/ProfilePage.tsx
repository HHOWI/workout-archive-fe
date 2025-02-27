import React, { useState, useRef } from "react";
import styled from "@emotion/styled";
import { useSelector } from "react-redux";
import WorkoutOfTheDay from "../components/WorkoutOfTheDay";
import { updateProfileImage } from "../api/user";

const Container = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  margin-bottom: 44px;
  gap: 30px;
`;

const DEFAULT_PROFILE_IMAGE = "/images/default-user.png"; // 기본 프로필 이미지 경로

const ProfileImage = styled.div<{ url: string }>`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  position: relative;

  &:hover::after {
    content: "수정하기";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 5px;
    text-align: center;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  border-top: 1px solid #dbdbdb;
  margin-top: 20px;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: 15px 0;
  background: none;
  border: none;
  border-top: 1px solid
    ${(props) => (props.isActive ? "#262626" : "transparent")};
  margin-top: -1px;
  color: ${(props) => (props.isActive ? "#262626" : "#8e8e8e")};
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #262626;
  }
`;

const WorkoutMemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
`;

const MemoCard = styled.div`
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 20px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const MemoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const MemoCategory = styled.span`
  background-color: #f0f7ff;
  color: #4a90e2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const MemoDate = styled.span`
  color: #8e8e8e;
  font-size: 0.9rem;
`;

const MemoContent = styled.p`
  color: #262626;
  line-height: 1.5;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"workout" | "memo">("workout");
  const user = useSelector((state: any) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState(
    user.profileImageUrl || DEFAULT_PROFILE_IMAGE
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await updateProfileImage(formData);
      const imageUrl = response.data.imageUrl;

      setProfileImage(imageUrl);
    } catch (error) {
      console.error("프로필 이미지 업로드 에러:", error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  const memoData = [
    {
      id: 1,
      category: "상체",
      date: "2024.03.21",
      content:
        "벤치프레스 자세 교정 필요. 어깨를 더 고정하고 팔꿈치 각도 주의.",
    },
    {
      id: 2,
      category: "하체",
      date: "2024.03.20",
      content: "스쿼트 깊이 개선됨. 무게 점진적 증량 시작해도 될 듯.",
    },
    // ... 더 많은 메모 데이터
  ];

  return (
    <Container>
      <ProfileHeader>
        <ProfileImage url={profileImage} onClick={handleImageClick} />
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <ProfileInfo>
          <Username>{user?.nickname || "사용자"}</Username>
          <div>
            <p>총 운동 기록: 156회</p>
            <p>연속 운동일수: 23일</p>
            <p>이번 달 목표 달성률: 89%</p>
          </div>
        </ProfileInfo>
      </ProfileHeader>

      <TabContainer>
        <TabList>
          <Tab
            isActive={activeTab === "workout"}
            onClick={() => setActiveTab("workout")}
          >
            내 운동 기록
          </Tab>
          <Tab
            isActive={activeTab === "memo"}
            onClick={() => setActiveTab("memo")}
          >
            내 운동 메모
          </Tab>
        </TabList>

        {activeTab === "workout" ? (
          <WorkoutOfTheDay />
        ) : (
          <WorkoutMemoGrid>
            {memoData.map((memo) => (
              <MemoCard key={memo.id}>
                <MemoHeader>
                  <MemoCategory>{memo.category}</MemoCategory>
                  <MemoDate>{memo.date}</MemoDate>
                </MemoHeader>
                <MemoContent>{memo.content}</MemoContent>
              </MemoCard>
            ))}
          </WorkoutMemoGrid>
        )}
      </TabContainer>
    </Container>
  );
};

export default ProfilePage;
