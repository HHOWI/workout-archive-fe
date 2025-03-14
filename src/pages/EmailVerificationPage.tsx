import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { verifyEmailAPI } from "../api/register";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const VerificationBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Message = styled.p<{ isError?: boolean }>`
  color: ${(props) => (props.isError ? "#dc3545" : "#28a745")};
  margin: 1rem 0;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("이메일 인증을 진행중입니다...");
  const isRequestSent = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    // 1. 토큰 없거나 이미 요청한 경우 중단
    if (!token || isRequestSent.current) return;

    // 2. 요청 플래그 설정
    isRequestSent.current = true;

    const verifyToken = async () => {
      try {
        await verifyEmailAPI(token);
        setStatus("success");
        setMessage("이메일 인증이 완료되었습니다.");
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "이메일 인증에 실패했습니다."
        );
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <Container>
      <VerificationBox>
        <h1>이메일 인증</h1>
        <Message isError={status === "error"}>{message}</Message>
        <Button onClick={() => navigate("/login")}>로그인 페이지로 이동</Button>
      </VerificationBox>
    </Container>
  );
};

export default EmailVerificationPage;
