// src/pages/LoginPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUserAPI } from "../api/user";
import { setUserInfo } from "../store/slices/authSlice";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { LoginDTO } from "../dtos/UserDTO";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { theme } from "../styles/theme";

// 애니메이션 정의
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// 스타일드 컴포넌트
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, ${theme.background}, #f8f9fa);
  padding: 1rem;
`;

const LoginContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const LoginHeader = styled.div`
  padding: 2.5rem 2.5rem 1.5rem;
  text-align: center;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${theme.text};
    margin-bottom: 0.5rem;
    font-family: "Pretendard", sans-serif;
  }

  p {
    color: ${theme.textLight};
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const LoginForm = styled.form`
  padding: 0 2.5rem 2.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.25rem;
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.textLight};
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${theme.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.5rem;
  border: 1px solid ${theme.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }

  &::placeholder {
    color: #c0c7d0;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: rgba(74, 144, 226, 0.85);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #c0c7d0;
    cursor: not-allowed;
  }
`;

const ErrorMessageWrapper = styled.div`
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 8px;
  background-color: #fff5f5;
  border: 1px solid #ffe3e3;
  color: #e53e3e;
  font-size: 0.9rem;
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AuthMessageWrapper = styled.div`
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background-color: #fdf9e8;
  border: 1px solid #f8e3a3;
  color: #975a16;
  font-size: 0.9rem;
  animation: ${slideIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoginFooter = styled.div`
  padding: 1.5rem 2.5rem;
  text-align: center;
  border-top: 1px solid ${theme.border};
  background-color: #f8f9fa;

  p {
    color: ${theme.textLight};
    margin-bottom: 0.5rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;

  a {
    color: ${theme.primary};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: rgba(74, 144, 226, 0.8);
      text-decoration: underline;
    }
  }
`;

// 아이콘 컴포넌트
const ErrorIcon = () => <FaExclamationTriangle style={{ color: "#e53e3e" }} />;
const AuthIcon = () => <FaExclamationTriangle style={{ color: "#975a16" }} />;

// 메시지 컴포넌트
const ErrorMessage = ({ message }: { message: string }) =>
  message ? (
    <ErrorMessageWrapper role="alert">
      <ErrorIcon />
      {message}
    </ErrorMessageWrapper>
  ) : null;

const AuthMessage = ({ message }: { message: string }) =>
  message ? (
    <AuthMessageWrapper role="alert">
      <AuthIcon />
      {message}
    </AuthMessageWrapper>
  ) : null;

/**
 * 로그인 페이지 컴포넌트
 */
const LoginPage: React.FC = () => {
  const [loginForm, setLoginForm] = useState<LoginDTO>({
    userId: "",
    userPw: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [authMessage, setAuthMessage] = useState<string>("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  // 인증 관련 메시지 처리
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "token_expired") {
      setAuthMessage(
        "로그인 인증 시간이 만료되었습니다. 다시 로그인해 주세요."
      );
    } else if (reason === "unauthenticated") {
      setAuthMessage("로그인이 필요한 페이지입니다.");
    }
  }, [searchParams]);

  // 입력 변경 핸들러
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLoginForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUserAPI(loginForm);
      dispatch(setUserInfo(response.data));
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginContainer>
        <LoginHeader>
          <h1>로그인</h1>
          <p>계정 정보를 입력하고 서비스를 이용하세요.</p>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          <AuthMessage message={authMessage} />
          <ErrorMessage message={error} />

          <InputGroup>
            <InputLabel htmlFor="userId">아이디</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                id="userId"
                name="userId"
                type="text"
                value={loginForm.userId}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="userPw">비밀번호</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                id="userPw"
                name="userPw"
                type="password"
                value={loginForm.userPw}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
              />
            </InputWrapper>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              "로그인 중..."
            ) : (
              <>
                <FaSignInAlt />
                로그인
              </>
            )}
          </LoginButton>
        </LoginForm>

        <LoginFooter>
          <p>계정이 없으신가요?</p>
          <FooterLinks>
            <Link to="/register">회원가입</Link>
            <Link to="/forgot-password">비밀번호 찾기</Link>
          </FooterLinks>
        </LoginFooter>
      </LoginContainer>
    </PageContainer>
  );
};

export default LoginPage;
