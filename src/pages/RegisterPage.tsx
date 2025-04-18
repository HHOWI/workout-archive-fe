import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import {
  checkUserIdAPI,
  checkUserEmailAPI,
  checkUserNicknameAPI,
  registerUserAPI,
} from "../api/register";
import { theme } from "../styles/theme";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaIdCard,
  FaCheck,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

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

const RegisterContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 2rem 0;
`;

const RegisterHeader = styled.div`
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

const RegisterForm = styled.form`
  padding: 0 2.5rem 2.5rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
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
  gap: 8px;
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
  flex: 1;
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

const CheckButton = styled.button`
  padding: 0.9rem 1rem;
  background-color: #3b7dd7;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 100px;

  &:hover:not(:disabled) {
    background-color: #2a68c0;
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

const RegisterButton = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: ${theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
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

const ValidationMessage = styled.div<{ isValid: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: ${(props) => (props.isValid ? "#2f9e44" : "#e53e3e")};
  gap: 6px;
  animation: ${slideIn} 0.3s ease-out;
`;

const RegisterFooter = styled.div`
  padding: 1.5rem 2.5rem;
  text-align: center;
  border-top: 1px solid ${theme.border};
  background-color: #f8f9fa;

  p {
    color: ${theme.textLight};
    font-size: 0.95rem;
  }

  a {
    color: ${theme.primary};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    margin-left: 0.5rem;

    &:hover {
      color: rgba(74, 144, 226, 0.8);
      text-decoration: underline;
    }
  }
`;

/**
 * 회원가입 페이지 컴포넌트
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userPwConfirm: "",
    userEmail: "",
    userNickname: "",
  });

  // 유효성 검증 상태
  const [validations, setValidations] = useState({
    userId: false,
    userEmail: false,
    userNickname: false,
    userPw: false,
    userPwConfirm: false,
  });

  // 유효성 메시지 상태
  const [messages, setMessages] = useState({
    userId: "",
    userEmail: "",
    userNickname: "",
    userPw: "",
    userPwConfirm: "",
    general: "",
  });

  // 필드별 기본 유효성 상태
  const [isIdValid, setIsIdValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState(false);

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 입력 변경 핸들러
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name === "userId") {
        // 아이디 입력값을 소문자로 변환
        const lowerValue = value.toLowerCase();
        setFormData((prev) => ({ ...prev, [name]: lowerValue }));

        // 아이디 유효성 검사 (영문 소문자로 시작, 영문 소문자+숫자 6-20자)
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
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "userPw") {
          // 비밀번호 유효성 검사 (8-20자)
          const isValid = value.length >= 8 && value.length <= 20;
          setValidations((prev) => ({ ...prev, userPw: isValid }));
          setMessages((prev) => ({
            ...prev,
            userPw: isValid
              ? "사용 가능한 비밀번호입니다."
              : "비밀번호는 8~20자 사이여야 합니다.",
          }));

          // 비밀번호 확인 필드 일치 여부 검사
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
          // 비밀번호 확인 일치 검사
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
          // 이메일 유효성 검사
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
          // 닉네임 유효성 검사 (한글, 영문, 숫자, 특수문자(_-.) 2-10자)
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
      }
    },
    [formData]
  );

  // 중복 확인 핸들러
  const handleCheck = useCallback(
    async (field: "userId" | "userEmail" | "userNickname") => {
      setLoading(true);
      try {
        let response;
        switch (field) {
          case "userId":
            response = await checkUserIdAPI(formData.userId);
            break;
          case "userEmail":
            response = await checkUserEmailAPI(formData.userEmail);
            break;
          case "userNickname":
            response = await checkUserNicknameAPI(formData.userNickname);
            break;
        }

        const { isDuplicated } = response.data;
        setValidations((prev) => ({ ...prev, [field]: !isDuplicated }));
        setMessages((prev) => ({
          ...prev,
          [field]: isDuplicated ? "이미 사용중입니다." : "사용 가능합니다.",
        }));
      } catch (error) {
        setMessages((prev) => ({
          ...prev,
          [field]: "확인에 실패했습니다.",
        }));
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // 폼 유효성 검사
      const isValid =
        validations.userId &&
        validations.userEmail &&
        validations.userNickname &&
        validations.userPw &&
        formData.userPw === formData.userPwConfirm &&
        formData.userPw.length >= 8;

      if (!isValid) {
        setMessages((prev) => ({
          ...prev,
          general: "모든 필드를 올바르게 입력하고 중복 확인을 완료해주세요.",
        }));
        return;
      }

      setLoading(true);
      try {
        const response = await registerUserAPI(formData);
        navigate("/register-success", {
          state: { email: formData.userEmail },
        });
      } catch (error) {
        console.error("회원가입 오류:", error);
        setMessages((prev) => ({
          ...prev,
          general: "회원가입에 실패했습니다.",
        }));
      } finally {
        setLoading(false);
      }
    },
    [formData, validations, navigate]
  );

  // 유효성 아이콘 렌더링
  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? (
      <FaCheckCircle style={{ color: "#2f9e44" }} />
    ) : (
      <FaExclamationTriangle style={{ color: "#e53e3e" }} />
    );

  return (
    <PageContainer>
      <RegisterContainer>
        <RegisterHeader>
          <h1>회원가입</h1>
          <p>계정을 생성하고 서비스를 이용하세요.</p>
        </RegisterHeader>

        <RegisterForm onSubmit={handleSubmit}>
          {messages.general && (
            <ValidationMessage isValid={false}>
              <FaExclamationTriangle />
              {messages.general}
            </ValidationMessage>
          )}

          <InputGroup>
            <InputLabel htmlFor="userId">아이디</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="영문 소문자, 숫자 (6~20자)"
                autoComplete="off"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userId")}
                disabled={!isIdValid || !formData.userId || loading}
              >
                <FaCheck />
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userId && (
              <ValidationMessage isValid={validations.userId}>
                <ValidationIcon isValid={validations.userId} />
                {messages.userId}
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="userPw">비밀번호</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                id="userPw"
                type="password"
                name="userPw"
                value={formData.userPw}
                onChange={handleChange}
                placeholder="8~20자 입력"
                autoComplete="new-password"
              />
            </InputWrapper>
            {messages.userPw && (
              <ValidationMessage isValid={validations.userPw}>
                <ValidationIcon isValid={validations.userPw} />
                {messages.userPw}
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="userPwConfirm">비밀번호 확인</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                id="userPwConfirm"
                type="password"
                name="userPwConfirm"
                value={formData.userPwConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
              />
            </InputWrapper>
            {messages.userPwConfirm && (
              <ValidationMessage
                isValid={
                  formData.userPw === formData.userPwConfirm &&
                  formData.userPwConfirm !== ""
                }
              >
                <ValidationIcon
                  isValid={
                    formData.userPw === formData.userPwConfirm &&
                    formData.userPwConfirm !== ""
                  }
                />
                {messages.userPwConfirm}
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="userEmail">이메일</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                id="userEmail"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="example@email.com"
                autoComplete="email"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userEmail")}
                disabled={!isEmailValid || !formData.userEmail || loading}
              >
                <FaCheck />
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userEmail && (
              <ValidationMessage isValid={validations.userEmail}>
                <ValidationIcon isValid={validations.userEmail} />
                {messages.userEmail}
              </ValidationMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="userNickname">닉네임</InputLabel>
            <InputWrapper>
              <InputIcon>
                <FaIdCard />
              </InputIcon>
              <Input
                id="userNickname"
                name="userNickname"
                value={formData.userNickname}
                onChange={handleChange}
                placeholder="한글, 영문, 숫자 (2~10자)"
                autoComplete="off"
              />
              <CheckButton
                type="button"
                onClick={() => handleCheck("userNickname")}
                disabled={!isNicknameValid || !formData.userNickname || loading}
              >
                <FaCheck />
                중복확인
              </CheckButton>
            </InputWrapper>
            {messages.userNickname && (
              <ValidationMessage isValid={validations.userNickname}>
                <ValidationIcon isValid={validations.userNickname} />
                {messages.userNickname}
              </ValidationMessage>
            )}
          </InputGroup>

          <RegisterButton
            type="submit"
            disabled={
              loading ||
              !(
                validations.userId &&
                validations.userEmail &&
                validations.userNickname &&
                validations.userPw &&
                formData.userPw === formData.userPwConfirm &&
                formData.userPw.length >= 8
              )
            }
          >
            {loading ? (
              "처리 중..."
            ) : (
              <>
                <FaUserPlus />
                회원가입
              </>
            )}
          </RegisterButton>
        </RegisterForm>

        <RegisterFooter>
          <p>
            이미 계정이 있으신가요?
            <Link to="/login">로그인</Link>
          </p>
        </RegisterFooter>
      </RegisterContainer>
    </PageContainer>
  );
};

export default RegisterPage;
