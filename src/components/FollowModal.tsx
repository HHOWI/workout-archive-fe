import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { getImageUrl } from "../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import {
  FollowerDTO,
  FollowingDTO,
  FollowingPlaceDTO,
} from "../dtos/FollowDTO";
import {
  FaUser,
  FaMapMarkerAlt,
  FaTimes,
  FaUserPlus,
  FaUserMinus,
  FaSpinner,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import {
  getFollowersAPI,
  getFollowingAPI,
  getFollowingPlacesAPI,
  followUserAPI,
  unfollowUserAPI,
  followPlaceAPI,
  unfollowPlaceAPI,
  checkUserFollowStatusAPI,
  checkPlaceFollowStatusAPI,
} from "../api/follow";

// 애니메이션 정의
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// 스타일 정의
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  border-bottom: ${(props) => (props.active ? "2px solid #4a90e2" : "none")};
  color: ${(props) => (props.active ? "#4a90e2" : "#666")};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ListContainer = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
`;

const EmptyStateIcon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
  color: #ccc;
`;

const EmptyStateText = styled.p`
  margin: 0;
  text-align: center;
  line-height: 1.5;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #f0f7ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  &:hover .user-image {
    border-color: #4a90e2;
  }

  &:hover .place-icon {
    background-color: #e1ebff;
    transform: scale(1.05);
  }

  &:hover .user-name {
    color: #4a90e2;
  }

  &:hover .user-name::after {
    width: 100%;
  }

  &:hover .sub-text {
    color: #555;
  }
`;

const UserImage = styled.div<{ url: string | null | undefined }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: url(${(props) => props.url || "/default-profile.png"});
  background-size: cover;
  background-position: center;
  margin-right: 12px;
  flex-shrink: 0;
  background-color: #f0f0f0;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
`;

const PlaceIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  color: #4a90e2;
  font-size: 18px;
  transition: all 0.3s ease;
`;

const InfoContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #4a90e2;
    transition: width 0.3s ease;
  }
`;

const SubText = styled.div`
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
`;

const ActionButton = styled.button<{ following?: boolean }>`
  background-color: ${(props) => (props.following ? "#f0f0f0" : "#4a90e2")};
  color: ${(props) => (props.following ? "#666" : "white")};
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.following ? "#e0e0e0" : "#3a7bc8")};
  }
`;

// 로딩 스피너 스타일
const LoadingSpinner = styled(FaSpinner)`
  font-size: 32px;
  color: #4a90e2;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  display: block;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface FollowModalProps {
  type: "followers" | "following" | "places";
  userSeq: number;
  onClose: () => void;
  currentUserSeq?: number;
  profileUserSeq?: number;
  onFollowStatusChange?: () => void;
}

const FollowModal: React.FC<FollowModalProps> = ({
  type,
  userSeq,
  onClose,
  currentUserSeq,
  profileUserSeq,
  onFollowStatusChange,
}) => {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<"users" | "places">(
    type === "places" ? "places" : "users"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowerDTO[]>([]);
  const [following, setFollowing] = useState<FollowingDTO[]>([]);
  const [followingPlaces, setFollowingPlaces] = useState<FollowingPlaceDTO[]>(
    []
  );
  const [userFollowStatuses, setUserFollowStatuses] = useState<
    Record<number, boolean>
  >({});
  const [placeFollowStatuses, setPlaceFollowStatuses] = useState<
    Record<number, boolean>
  >({});
  const navigate = useNavigate();

  // 데이터 로드 함수들
  const fetchFollowers = async () => {
    setIsLoading(true);
    try {
      const data = await getFollowersAPI(userSeq);
      setFollowers(data);

      if (currentUserSeq) {
        const statuses: Record<number, boolean> = {};
        await Promise.all(
          data.map(async (follower) => {
            if (follower.userSeq === currentUserSeq) return;
            try {
              statuses[follower.userSeq] = await checkUserFollowStatusAPI(
                follower.userSeq
              );
            } catch (error) {
              console.error(
                `사용자 ${follower.userSeq} 팔로우 상태 확인 중 오류:`,
                error
              );
            }
          })
        );
        setUserFollowStatuses((prev) => ({ ...prev, ...statuses }));
      }
    } catch (error) {
      console.error("팔로워 목록 조회 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async () => {
    setIsLoading(true);
    try {
      const data = await getFollowingAPI(userSeq);
      setFollowing(data);

      if (currentUserSeq) {
        const statuses: Record<number, boolean> = {};
        await Promise.all(
          data.map(async (follow) => {
            if (follow.userSeq === currentUserSeq) return;
            try {
              statuses[follow.userSeq] = await checkUserFollowStatusAPI(
                follow.userSeq
              );
            } catch (error) {
              console.error(
                `사용자 ${follow.userSeq} 팔로우 상태 확인 중 오류:`,
                error
              );
            }
          })
        );
        setUserFollowStatuses((prev) => ({ ...prev, ...statuses }));
      }
    } catch (error) {
      console.error("팔로잉 목록 조회 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowingPlaces = async () => {
    setIsLoading(true);
    try {
      const data = await getFollowingPlacesAPI(userSeq);
      setFollowingPlaces(data);

      if (currentUserSeq && data.length > 0) {
        // 장소 팔로우 상태 병렬 확인 (Promise.all 사용)
        const placeSeqs = data.map((place) => place.workoutPlaceSeq);
        try {
          const statuses = await Promise.all(
            placeSeqs.map(async (seq) => {
              try {
                const isFollowing = await checkPlaceFollowStatusAPI(seq);
                return { seq, isFollowing };
              } catch (singleError) {
                console.error(
                  `장소 ${seq} 팔로우 상태 확인 중 오류:`,
                  singleError
                );
                return { seq, isFollowing: false }; // 오류 시 false로 간주
              }
            })
          );

          // 결과를 Record 형태로 변환하여 상태 업데이트
          const statusMap = statuses.reduce((acc, { seq, isFollowing }) => {
            acc[seq] = isFollowing;
            return acc;
          }, {} as Record<number, boolean>);
          setPlaceFollowStatuses(statusMap);
        } catch (error) {
          console.error("장소 팔로우 상태 병렬 확인 중 오류:", error);
          // 오류 발생 시 모든 상태를 false로 초기화
          const initialStatuses: Record<number, boolean> = {};
          placeSeqs.forEach((seq) => {
            initialStatuses[seq] = false;
          });
          setPlaceFollowStatuses(initialStatuses);
        }
      }
    } catch (error) {
      console.error("팔로잉 장소 목록 조회 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 팔로우/언팔로우 핸들러
  const handleFollowUserToggle = async (
    e: React.MouseEvent,
    targetUserSeq: number
  ) => {
    e.stopPropagation();
    if (!currentUserSeq) return;

    try {
      if (userFollowStatuses[targetUserSeq]) {
        await unfollowUserAPI(targetUserSeq);
        setUserFollowStatuses((prev) => ({
          ...prev,
          [targetUserSeq]: false,
        }));
      } else {
        await followUserAPI(targetUserSeq);
        setUserFollowStatuses((prev) => ({
          ...prev,
          [targetUserSeq]: true,
        }));
      }

      // 항상 팔로워/팔로잉 카운트 업데이트가 필요
      if (onFollowStatusChange) {
        onFollowStatusChange();
      }
    } catch (error) {
      console.error(`사용자 팔로우 상태 변경 중 오류:`, error);
    }
  };

  // 장소 팔로우/언팔로우 핸들러
  const handleFollowPlaceToggle = async (
    e: React.MouseEvent,
    placeSeq: number
  ) => {
    e.stopPropagation();
    if (!currentUserSeq) return;

    try {
      if (placeFollowStatuses[placeSeq]) {
        await unfollowPlaceAPI(placeSeq);
        setPlaceFollowStatuses((prev) => ({
          ...prev,
          [placeSeq]: false,
        }));
      } else {
        await followPlaceAPI(placeSeq);
        setPlaceFollowStatuses((prev) => ({
          ...prev,
          [placeSeq]: true,
        }));
      }

      // 항상 팔로워/팔로잉 카운트 업데이트가 필요
      if (onFollowStatusChange) {
        onFollowStatusChange();
      }
    } catch (error) {
      console.error(`장소 팔로우 상태 변경 중 오류:`, error);
    }
  };

  // 모달 열릴 때 데이터 로드
  useEffect(() => {
    if (type === "followers") {
      fetchFollowers();
    } else if (type === "following") {
      fetchFollowing();
      if (activeTab === "places") {
        fetchFollowingPlaces();
      }
    } else if (type === "places") {
      fetchFollowingPlaces();
    }
  }, [type, userSeq]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (type === "following" && activeTab === "places") {
      fetchFollowingPlaces();
    }
  }, [activeTab]);

  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 프로필로 이동
  const navigateToProfile = (nickname: string) => {
    onClose();
    navigate(`/profile/${nickname}`);
  };

  // 장소로 이동
  const navigateToPlace = (placeSeq: number) => {
    onClose();
    navigate(`/workoutplace/${placeSeq}`);
  };

  // 타이틀 결정
  const getTitle = () => {
    switch (type) {
      case "followers":
        return "팔로워";
      case "following":
        return activeTab === "users" ? "팔로잉" : "팔로우한 장소";
      case "places":
        return "팔로우한 장소";
      default:
        return "";
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{getTitle()}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {type === "following" && (
          <TabContainer>
            <Tab
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            >
              사용자
            </Tab>
            <Tab
              active={activeTab === "places"}
              onClick={() => setActiveTab("places")}
            >
              장소
            </Tab>
          </TabContainer>
        )}

        <ListContainer>
          {isLoading ? (
            <EmptyState>
              <LoadingSpinner />
              <EmptyStateText>로딩 중...</EmptyStateText>
            </EmptyState>
          ) : type === "followers" && followers.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <FaUser />
              </EmptyStateIcon>
              <EmptyStateText>아직 팔로워가 없습니다.</EmptyStateText>
            </EmptyState>
          ) : type === "following" &&
            activeTab === "users" &&
            following.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <FaUser />
              </EmptyStateIcon>
              <EmptyStateText>아직 팔로우한 사용자가 없습니다.</EmptyStateText>
            </EmptyState>
          ) : ((type === "following" && activeTab === "places") ||
              type === "places") &&
            followingPlaces.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <FaMapMarkerAlt />
              </EmptyStateIcon>
              <EmptyStateText>아직 팔로우한 장소가 없습니다.</EmptyStateText>
            </EmptyState>
          ) : type === "followers" ? (
            followers.map((user) => (
              <ListItem
                key={user.userSeq}
                onClick={() => navigateToProfile(user.userNickname)}
              >
                <UserImage
                  className="user-image"
                  url={getImageUrl(user.profileImageUrl)}
                />
                <InfoContainer>
                  <UserName className="user-name">{user.userNickname}</UserName>
                </InfoContainer>
                {currentUserSeq && currentUserSeq !== user.userSeq && (
                  <ActionButton
                    following={userFollowStatuses[user.userSeq]}
                    onClick={(e) => handleFollowUserToggle(e, user.userSeq)}
                  >
                    {userFollowStatuses[user.userSeq] ? (
                      <>
                        <FaUserMinus size={12} /> 팔로잉
                      </>
                    ) : (
                      <>
                        <FaUserPlus size={12} /> 팔로우
                      </>
                    )}
                  </ActionButton>
                )}
              </ListItem>
            ))
          ) : type === "following" && activeTab === "users" ? (
            following.map((user) => (
              <ListItem
                key={user.userSeq}
                onClick={() => navigateToProfile(user.userNickname)}
              >
                <UserImage
                  className="user-image"
                  url={getImageUrl(user.profileImageUrl)}
                />
                <InfoContainer>
                  <UserName className="user-name">{user.userNickname}</UserName>
                </InfoContainer>
                {currentUserSeq && currentUserSeq !== user.userSeq && (
                  <ActionButton
                    following={userFollowStatuses[user.userSeq]}
                    onClick={(e) => handleFollowUserToggle(e, user.userSeq)}
                  >
                    {userFollowStatuses[user.userSeq] ? (
                      <>
                        <FaUserMinus size={12} /> 팔로잉
                      </>
                    ) : (
                      <>
                        <FaUserPlus size={12} /> 팔로우
                      </>
                    )}
                  </ActionButton>
                )}
              </ListItem>
            ))
          ) : (
            followingPlaces.map((place) => (
              <ListItem
                key={place.workoutPlaceSeq}
                onClick={() => navigateToPlace(place.workoutPlaceSeq)}
              >
                <PlaceIcon className="place-icon">
                  <FaMapMarkerAlt />
                </PlaceIcon>
                <InfoContainer>
                  <UserName className="user-name">{place.placeName}</UserName>
                  <SubText className="sub-text">{place.addressName}</SubText>
                </InfoContainer>
                {currentUserSeq && (
                  <ActionButton
                    following={placeFollowStatuses[place.workoutPlaceSeq]}
                    onClick={(e) =>
                      handleFollowPlaceToggle(e, place.workoutPlaceSeq)
                    }
                  >
                    {placeFollowStatuses[place.workoutPlaceSeq] ? (
                      <>
                        <FaMinus size={12} /> 언팔로우
                      </>
                    ) : (
                      <>
                        <FaPlus size={12} /> 팔로우
                      </>
                    )}
                  </ActionButton>
                )}
              </ListItem>
            ))
          )}
        </ListContainer>
      </ModalContainer>
    </Overlay>
  );
};

export default FollowModal;
