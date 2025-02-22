import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import {
  checkUserId,
  checkUserEmail,
  checkUserNickname,
  registerUser,
} from "../api/user";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const RegisterBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CheckButton = styled.button`
  padding: 0 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const RegisterButton = styled.button`
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

const ValidationMessage = styled.span<{ isValid: boolean }>`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => (props.isValid ? "#28a745" : "#dc3545")};
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userPwConfirm: "",
    userEmail: "",
    userNickname: "",
  });

  const [validations, setValidations] = useState({
    userId: false,
    userEmail: false,
    userNickname: false,
    userPw: false,
    userPwConfirm: false,
  });

  const [messages, setMessages] = useState({
    userId: "",
    userEmail: "",
    userNickname: "",
    userPw: "",
    userPwConfirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "userPw") {
      const isValidPassword = value.length >= 8;
      setValidations((prev) => ({
        ...prev,
        userPw: isValidPassword,
        userPwConfirm: isValidPassword && value === formData.userPwConfirm,
      }));
      setMessages((prev) => ({
        ...prev,
        userPw: isValidPassword ? "" : "비밀번호는 8자 이상이어야 합니다.",
      }));

      if (formData.userPwConfirm) {
        setMessages((prev) => ({
          ...prev,
          userPwConfirm:
            value === formData.userPwConfirm
              ? ""
              : "비밀번호가 일치하지 않습니다.",
        }));
      }
    }

    if (name === "userPwConfirm") {
      const isMatch = value === formData.userPw;
      setValidations((prev) => ({
        ...prev,
        userPwConfirm: isMatch,
      }));
      setMessages((prev) => ({
        ...prev,
        userPwConfirm: isMatch ? "" : "비밀번호가 일치하지 않습니다.",
      }));
    }
  };

  const handleCheck = async (
    field: "userId" | "userEmail" | "userNickname"
  ) => {
    try {
      let response;
      switch (field) {
        case "userId":
          response = await checkUserId(formData.userId);
          break;
        case "userEmail":
          response = await checkUserEmail(formData.userEmail);
          break;
        case "userNickname":
          response = await checkUserNickname(formData.userNickname);
          break;
      }

      const { duplicated } = response.data;
      setValidations((prev) => ({ ...prev, [field]: !duplicated }));
      setMessages((prev) => ({
        ...prev,
        [field]: duplicated ? "이미 사용중입니다." : "사용 가능합니다.",
      }));
    } catch (error) {
      setMessages((prev) => ({
        ...prev,
        [field]: "확인에 실패했습니다.",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Object.values(validations).every(Boolean)) return;

    try {
      await registerUser(formData);
      navigate("/register-success", {
        state: { email: formData.userEmail },
      });
    } catch (error) {
      setMessages((prev) => ({
        ...prev,
        general: "회원가입에 실패했습니다.",
      }));
    }
  };

  const isFormValid = () => {
    return (
      Object.values(validations).every(Boolean) &&
      formData.userPw === formData.userPwConfirm &&
      formData.userPw.length >= 8
    );
  };

  return (
    <Container>
      <RegisterBox>
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>아이디</label>
            <InputWrapper>
              <Input
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userId")}
                disabled={!formData.userId}
              >
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userId && (
              <ValidationMessage isValid={validations.userId}>
                {messages.userId}
              </ValidationMessage>
            )}
          </FormGroup>
          <FormGroup>
            <label>비밀번호</label>
            <InputWrapper>
              <Input
                type="password"
                name="userPw"
                value={formData.userPw}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
              />
            </InputWrapper>
            {messages.userPw && (
              <ValidationMessage isValid={validations.userPw}>
                {messages.userPw}
              </ValidationMessage>
            )}
          </FormGroup>
          <FormGroup>
            <label>비밀번호 확인</label>
            <InputWrapper>
              <Input
                type="password"
                name="userPwConfirm"
                value={formData.userPwConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </InputWrapper>
            {messages.userPwConfirm && (
              <ValidationMessage
                isValid={formData.userPw === formData.userPwConfirm}
              >
                {messages.userPwConfirm}
              </ValidationMessage>
            )}
          </FormGroup>
          <FormGroup>
            <label>이메일</label>
            <InputWrapper>
              <Input
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userEmail")}
                disabled={!formData.userEmail}
              >
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userEmail && (
              <ValidationMessage isValid={validations.userEmail}>
                {messages.userEmail}
              </ValidationMessage>
            )}
          </FormGroup>
          <FormGroup>
            <label>닉네임</label>
            <InputWrapper>
              <Input
                name="userNickname"
                value={formData.userNickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userNickname")}
                disabled={!formData.userNickname}
              >
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userNickname && (
              <ValidationMessage isValid={validations.userNickname}>
                {messages.userNickname}
              </ValidationMessage>
            )}
          </FormGroup>
          <RegisterButton type="submit" disabled={!isFormValid()}>
            회원가입
          </RegisterButton>
        </form>
      </RegisterBox>
    </Container>
  );
};

export default RegisterPage;
