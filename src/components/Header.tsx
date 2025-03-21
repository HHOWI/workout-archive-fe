import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUserInfo } from "../store/slices/authSlice";
import { logoutUserAPI } from "../api/user";
import { RootState } from "../store/store";

const HeaderContainer = styled.header`
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
  cursor: pointer;
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled.span`
  color: #333;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #4a90e2;
  }
`;

const UserMenu = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f7ff;
  }
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const handleLogout = async () => {
    try {
      await logoutUserAPI();
      dispatch(clearUserInfo());
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={() => navigate("/")}>WOA</Logo>
        <Nav>
          <NavLink onClick={() => navigate("/workout-record")}>
            운동 기록
          </NavLink>
          <NavLink onClick={() => navigate("/statistics")}>통계</NavLink>
          <NavLink onClick={() => navigate("/community")}>커뮤니티</NavLink>
          {userInfo ? (
            <UserMenu>
              <NavLink onClick={() => navigate(`/${userInfo.userNickname}`)}>
                {userInfo.userNickname}
              </NavLink>
              <UserButton onClick={handleLogout}>로그아웃</UserButton>
            </UserMenu>
          ) : (
            <UserButton onClick={() => navigate("/login")}>로그인</UserButton>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
