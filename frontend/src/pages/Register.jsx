import React, { useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>◈</span>
          <span style={styles.brandName}>Spendly</span>
        </div>
        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.sub}>Start tracking your spending today</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          {[
            { label: "Full name", type: "text", val: name, set: setName, ph: "Your name" },
            { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
            { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type} value={val} required placeholder={ph}
                onChange={e => set(e.target.value)}
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e8e8e6"}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{...styles.btn, opacity: loading ? 0.7 : 1}}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={styles.link}>Sign in</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf9", fontFamily: "'Inter', sans-serif" },
  card: { width: "100%", maxWidth: 400, padding: "40px 40px 32px", background: "#fff", border: "1px solid #e8e8e6", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" },
  brand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  brandIcon: { fontSize: 20, color: "#2563eb" },
  brandName: { fontSize: 16, fontWeight: 600, color: "#191919", letterSpacing: "-0.01em" },
  heading: { fontSize: 22, fontWeight: 600, color: "#191919", margin: "0 0 4px", letterSpacing: "-0.02em" },
  sub: { fontSize: 14, color: "#6b6b6b", margin: "0 0 24px" },
  errorBox: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#374151" },
  input: { padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", background: "#fff", outline: "none", transition: "border-color 0.15s", fontFamily: "'Inter', sans-serif" },
  btn: { marginTop: 4, padding: "10px 16px", background: "#191919", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  footer: { textAlign: "center", fontSize: 13, color: "#6b6b6b", marginTop: 20 },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: 500 },
};

export default Register;
