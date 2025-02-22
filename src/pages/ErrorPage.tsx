import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 5rem;
  color: #dc3545;
  margin-bottom: 2rem;
`;

const ErrorTitle = styled.h1`
  font-size: 2.5rem;
  color: #343a40;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const HomeButton = styled.button`
  padding: 0.75rem 1.5rem;
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
`;

const ErrorDetails = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f1f3f5;
  border-radius: 4px;
  font-family: monospace;
  max-width: 800px;
  overflow-x: auto;
`;

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: any;
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (error.status === 404) {
      return "요청하신 페이지를 찾을 수 없습니다.";
    }
    if (error.status === 403) {
      return "접근 권한이 없습니다.";
    }
    return error.message || "예상치 못한 오류가 발생했습니다.";
  };

  return (
    <Container>
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorTitle>
        {error.status ? `${error.status} Error` : "오류가 발생했습니다"}
      </ErrorTitle>
      <ErrorMessage>{getErrorMessage()}</ErrorMessage>
      <HomeButton onClick={() => navigate("/")}>홈으로 돌아가기</HomeButton>

      {process.env.NODE_ENV === "development" && error.data && (
        <ErrorDetails>
          <pre>{JSON.stringify(error.data, null, 2)}</pre>
        </ErrorDetails>
      )}
    </Container>
  );
};

export default ErrorPage;
