import React, { useState } from "react";
import axios from "../utils/axios";

const AddExpenseForm = ({ budgetId, onExpenseAdded }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await axios.post(`/api/budgets/${budgetId}/expenses`,
        { description, amount: parseFloat(amount), date },
        { headers: { email: localStorage.getItem("email") } }
      );
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onExpenseAdded();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#191919", marginBottom: 20 }}>Add Expense</div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>✓ Expense added!</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Description" value={description} setValue={setDescription} placeholder="e.g. McDonald's" />
        <Field label="Amount (RM)" type="number" value={amount} setValue={setAmount} placeholder="25.00" extra={{ min: "0.01", step: "0.01" }} />
        <Field label="Date" type="date" value={date} setValue={setDate} />
        <button type="submit" disabled={loading} style={{ ...styles.submit, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, type = "text", value, setValue, placeholder, extra }) => (
  <div>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} required placeholder={placeholder} onChange={event => setValue(event.target.value)} style={styles.input} {...(extra || {})} />
  </div>
);

const styles = {
  card: { background: "#fafaf9", border: "1px solid #e8e8e6", borderRadius: 10, padding: 24, fontFamily: "'Inter', sans-serif" },
  error: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  success: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", background: "#fff", outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" },
  submit: { padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif", marginTop: 4 },
};

export default AddExpenseForm;
