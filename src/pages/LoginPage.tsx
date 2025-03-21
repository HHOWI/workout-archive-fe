// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUserAPI } from "../api/user";
import { setUserInfo } from "../store/slices/authSlice";
import styled from "@emotion/styled";
import { LoginDTO } from "../dtos/UserDTO";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LoginBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
`;

const LoginFooter = styled.div`
  margin-top: 1.5rem;
  text-align: center;

  a {
    color: #007bff;
    text-decoration: none;
    margin: 0 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AuthMessage = styled.p`
  color: #dc3545; // 경고 느낌으로 빨간색 사용
  text-align: center;
  margin-bottom: 1rem;
`;

const LoginPage: React.FC = () => {
  const [loginDTO, setLoginDTO] = useState<LoginDTO>({
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

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "token_expired") {
      setAuthMessage(
        "로그인 인증 시간이 만료되었습니다. 다시 로그인해 주세요."
      );
    } else if (reason === "unauthenticated") {
      setAuthMessage("로그인이 필요합니다.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginDTO((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUserAPI(loginDTO);
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
    <Container>
      <LoginBox>
        <h1>로그인</h1>
        {authMessage && <AuthMessage>{authMessage}</AuthMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="userId">아이디</label>
            <input
              id="userId"
              name="userId"
              type="text"
              value={loginDTO.userId}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="userPw">비밀번호</label>
            <input
              id="userPw"
              name="userPw"
              type="password"
              value={loginDTO.userPw}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </FormGroup>
          <LoginButton type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </LoginButton>
        </form>
        <LoginFooter>
          <a href="/register">회원가입</a>
          <span> | </span>
          <a href="/forgot-password">비밀번호 찾기</a>
        </LoginFooter>
      </LoginBox>
    </Container>
  );
};

export default LoginPage;
