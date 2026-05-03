import React, { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const user = res.data;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fu = result.user;
      const res = await axios.post("/api/auth/google", {
        email: fu.email, name: fu.displayName, uid: fu.uid,
      });
      const user = res.data;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>◈</span>
          <span style={styles.brandName}>Spendly</span>
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your workspace</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" value={email} required
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e8e8e6"}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" value={password} required
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e8e8e6"}
            />
          </div>
          <button type="submit" disabled={loading} style={{...styles.btn, opacity: loading ? 0.7 : 1}}>
            {loading ? "Signing in…" : "Continue with email"}
          </button>
        </form>

        <div style={styles.divider}><span style={styles.dividerText}>or</span></div>

        <button onClick={handleGoogleLogin} style={styles.googleBtn}>
          <img src="https://www.svgrepo.com/show/355037/google.svg" style={{width:16,height:16}} alt="" />
          Continue with Google
        </button>

        <p style={styles.footer}>
          No account?{" "}
          <span onClick={() => navigate("/register")} style={styles.link}>
            Create one free
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fafaf9", fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%", maxWidth: 400, padding: "40px 40px 32px",
    background: "#fff", border: "1px solid #e8e8e6", borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
  },
  brand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  brandIcon: { fontSize: 20, color: "#2563eb" },
  brandName: { fontSize: 16, fontWeight: 600, color: "#191919", letterSpacing: "-0.01em" },
  heading: { fontSize: 22, fontWeight: 600, color: "#191919", margin: "0 0 4px", letterSpacing: "-0.02em" },
  sub: { fontSize: 14, color: "#6b6b6b", margin: "0 0 24px" },
  errorBox: {
    background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#374151" },
  input: {
    padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8,
    fontSize: 14, color: "#191919", background: "#fff", outline: "none",
    transition: "border-color 0.15s", fontFamily: "'Inter', sans-serif",
  },
  btn: {
    marginTop: 4, padding: "10px 16px", background: "#191919", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "background 0.15s",
  },
  divider: {
    display: "flex", alignItems: "center", margin: "20px 0",
    borderTop: "1px solid #e8e8e6", position: "relative",
  },
  dividerText: {
    position: "absolute", left: "50%", transform: "translateX(-50%)",
    background: "#fff", padding: "0 10px", fontSize: 12, color: "#9b9b9b",
  },
  googleBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", padding: "9px 16px", background: "#fff",
    border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: "#374151", cursor: "pointer", fontFamily: "'Inter', sans-serif",
    transition: "background 0.15s",
  },
  footer: { textAlign: "center", fontSize: 13, color: "#6b6b6b", marginTop: 20 },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: 500 },
};

export default Login;
