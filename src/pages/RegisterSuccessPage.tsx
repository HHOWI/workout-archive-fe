import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const SuccessBox = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Title = styled.h1`
  color: #28a745;
  margin-bottom: 1.5rem;
`;

const Message = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #555;

  p {
    margin: 0.5rem 0;
  }

  .email {
    font-weight: bold;
    color: #007bff;
  }
`;

const LoginButton = styled.button`
  padding: 0.75rem 2rem;
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

const RegisterSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <Container>
      <SuccessBox>
        <Title>회원가입 신청 완료</Title>
        <Message>
          <p>회원가입 신청이 완료되었습니다.</p>
          <p>
            <span className="email">{email}</span>로 인증 메일이 발송되었습니다.
          </p>
          <p>이메일 인증 완료 후 로그인이 가능합니다.</p>
        </Message>
        <LoginButton onClick={() => navigate("/login")}>
          로그인 페이지로 이동
        </LoginButton>
      </SuccessBox>
    </Container>
  );
};

export default RegisterSuccessPage;
