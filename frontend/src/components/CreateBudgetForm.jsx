import React, { useState } from "react";
import axios from "../utils/axios";

const EMOJIS = ["🍔", "🚗", "🏠", "✈️", "💊", "🎮", "📚", "👕", "☕", "🏋️", "🎵", "💄", "🛒", "💡", "📱", "💰"];

const CreateBudgetForm = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [icon, setIcon] = useState("💰");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Not logged in");
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      await axios.post("/api/budgets", {
        icon,
        name,
        amount: parseFloat(amount),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        userId: parseInt(userId, 10),
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: "'Inter', sans-serif" }}>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.field}>
        <label style={styles.label}>Icon</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {EMOJIS.map((emoji) => (
            <button key={emoji} type="button" onClick={() => setIcon(emoji)} style={{ ...styles.emojiBtn, borderColor: icon === emoji ? "#2563eb" : "#e8e8e6", background: icon === emoji ? "#eff6ff" : "#fff" }}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <Field label="Budget Name" value={name} setValue={setName} placeholder="e.g. Food, Rent, Transport" />
      <Field label="Amount (RM)" type="number" value={amount} setValue={setAmount} placeholder="500" extra={{ min: "1", step: "0.01" }} />
      <button type="submit" disabled={loading} style={{ ...styles.submit, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Creating..." : "Create Budget"}
      </button>
    </form>
  );
};

const Field = ({ label, type = "text", value, setValue, placeholder, extra }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} required placeholder={placeholder} onChange={event => setValue(event.target.value)} style={styles.input} {...(extra || {})} />
  </div>
);

const styles = {
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" },
  emojiBtn: { width: 36, height: 36, borderRadius: 8, border: "2px solid #e8e8e6", fontSize: 18, cursor: "pointer" },
  submit: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  error: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
};

export default CreateBudgetForm;
