import React from "react";
import styled from "@emotion/styled";

const FooterContainer = styled.footer`
  background-color: #f8f9fa;
  padding: 3rem 2rem;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    color: #333;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #4a90e2;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
  color: #666;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>서비스 소개</h3>
          <ul>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/features">주요 기능</a>
            </li>
            <li>
              <a href="/pricing">요금제</a>
            </li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>고객 지원</h3>
          <ul>
            <li>
              <a href="/faq">자주 묻는 질문</a>
            </li>
            <li>
              <a href="/contact">문의하기</a>
            </li>
            <li>
              <a href="/feedback">피드백</a>
            </li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>법적 고지</h3>
          <ul>
            <li>
              <a href="/privacy">개인정보처리방침</a>
            </li>
            <li>
              <a href="/terms">이용약관</a>
            </li>
            <li>
              <a href="/cookies">쿠키 정책</a>
            </li>
          </ul>
        </FooterSection>
      </FooterContent>
      <Copyright>© 2024 Workout Archive. All rights reserved.</Copyright>
    </FooterContainer>
  );
};

export default Footer;
