import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/user";

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(userId, userPw);
      const data = response.data as { token: string; userSeq: number };
      localStorage.setItem("token", data.token);
      setLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="userId">아이디</label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="userPw">비밀번호</label>
          <input
            id="userPw"
            type="password"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem" }}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
