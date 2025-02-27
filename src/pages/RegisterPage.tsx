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

  const [isIdValid, setIsIdValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "userId") {
      // 입력값을 소문자로 변환
      const lowerValue = value.toLowerCase();
      setFormData((prev) => ({ ...prev, [name]: lowerValue }));

      const userIdRegex = /^[a-z][a-z0-9]{5,19}$/;
      const isValid = userIdRegex.test(lowerValue);
      setIsIdValid(isValid);
      setValidations((prev) => ({ ...prev, userId: false }));
      setMessages((prev) => ({
        ...prev,
        userId: isValid
          ? "중복 확인이 필요합니다."
          : "아이디는 영문 소문자로 시작하고 영문 소문자와 숫자를 포함하여 6~20자여야 합니다.",
      }));
    } else if (name === "userPw") {
      const isValid = value.length >= 8 && value.length <= 20;
      setValidations((prev) => ({ ...prev, userPw: isValid }));
      setMessages((prev) => ({
        ...prev,
        userPw: isValid
          ? "사용 가능한 비밀번호입니다."
          : "비밀번호는 8~20자 사이여야 합니다.",
      }));

      // 비밀번호 확인 필드가 비어있지 않은 경우 일치 여부 검사
      if (formData.userPwConfirm) {
        setValidations((prev) => ({
          ...prev,
          userPwConfirm: value === formData.userPwConfirm,
        }));
        setMessages((prev) => ({
          ...prev,
          userPwConfirm:
            value === formData.userPwConfirm
              ? ""
              : "비밀번호가 일치하지 않습니다.",
        }));
      }
    } else if (name === "userPwConfirm") {
      const isMatch = value === formData.userPw;
      setValidations((prev) => ({
        ...prev,
        userPwConfirm: isMatch && validations.userPw,
      }));
      setMessages((prev) => ({
        ...prev,
        userPwConfirm: isMatch ? "" : "비밀번호가 일치하지 않습니다.",
      }));
    } else if (name === "userEmail") {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      const isValid = emailRegex.test(value);
      setIsEmailValid(isValid);
      setValidations((prev) => ({ ...prev, userEmail: false }));
      setMessages((prev) => ({
        ...prev,
        userEmail: isValid
          ? "중복 확인이 필요합니다."
          : "올바른 이메일 형식이 아닙니다.",
      }));
    } else if (name === "userNickname") {
      const nicknameRegex = /^[가-힣a-zA-Z0-9._-]{2,10}$/;
      const isValid = nicknameRegex.test(value);
      setIsNicknameValid(isValid);
      setValidations((prev) => ({ ...prev, userNickname: false }));
      setMessages((prev) => ({
        ...prev,
        userNickname: isValid
          ? "중복 확인이 필요합니다."
          : "닉네임은 2~10자의 한글, 영문, 숫자와 특수문자(_-.)만 사용 가능합니다.",
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
                disabled={!isIdValid || !formData.userId}
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
                disabled={!isEmailValid || !formData.userEmail}
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
                disabled={!isNicknameValid || !formData.userNickname}
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
