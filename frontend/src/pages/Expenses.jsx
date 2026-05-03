import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import AddExpenseForm from "../components/AddExpenseForm";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Pencil, Trash2 } from "lucide-react";
import { currentMonthKey, expenseMonthKey, formatMoney, spentForBudget } from "../utils/finance";

const Expenses = () => {
  const { budgetId } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showBudgetDel, setShowBudgetDel] = useState(false);
  const PER_PAGE = 8;

  const fetchBudget = useCallback(async () => {
    try {
      setError("");
      const email = localStorage.getItem("email");
      const r = await axios.get(`/api/budgets/${budgetId}`, { headers: { email } });
      setBudget(r.data);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to load budget");
    }
  }, [budgetId]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  if (error) return (
    <div style={styles.centerColumn}>
      <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>
      <button onClick={() => navigate("/budgets")} style={styles.secondaryBtn}>Back to Budgets</button>
    </div>
  );

  if (!budget) return <div style={styles.center}>Loading...</div>;

  const expenses = [...(budget.expenses || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const monthExpenses = expenses.filter(expense => expenseMonthKey(expense.date) === currentMonthKey());
  const spent = spentForBudget(budget);
  const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const over = spent > budget.amount;
  const totalPages = Math.max(1, Math.ceil(expenses.length / PER_PAGE));
  const current = expenses.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDeleteExpense = async () => {
    await axios.delete(`/api/budgets/${budgetId}/expenses/${deleteId}`, { headers: { email: localStorage.getItem("email") } });
    setDeleteId(null);
    fetchBudget();
  };

  const handleDeleteBudget = async () => {
    await axios.delete(`/api/budgets/${budgetId}`, { headers: { email: localStorage.getItem("email") } });
    navigate("/budgets");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate("/budgets")} style={styles.backBtn}>← Back to Budgets</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.budgetIcon}>{budget.icon || "\uD83D\uDCB0"}</div>
            <div>
              <h1 style={styles.title}>{budget.name}</h1>
              <div style={styles.subtle}>{formatMoney(spent)} of {formatMoney(budget.amount)} this month</div>
            </div>
          </div>
          <button onClick={() => setShowBudgetDel(true)} style={styles.deleteBudgetBtn}>Delete Budget</button>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${pct}%`, background: over ? "#dc2626" : pct > 80 ? "#d97706" : "#2563eb" }} />
        </div>
        <div style={styles.subtle}>{pct.toFixed(0)}% used this month · {monthExpenses.length} current-month transactions</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        <div style={styles.card}>
          <div style={styles.tableHeader}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#191919" }}>Expenses</div>
            <span style={styles.countPill}>{expenses.length}</span>
          </div>
          {expenses.length === 0 ? (
            <div style={styles.empty}>No expenses yet. Add one →</div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafaf9" }}>
                    {["Description", "Amount", "Date", ""].map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {current.map(expense => (
                    <tr key={expense.id} style={{ borderTop: "1px solid #f1f1ef" }}>
                      <td style={styles.td}>{expense.description}</td>
                      <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>{formatMoney(expense.amount)}</td>
                      <td style={{ ...styles.td, textAlign: "right", color: "#9b9b9b" }}>{expense.date ? new Date(expense.date).toLocaleDateString("en-MY", { day: "numeric", month: "short" }) : "-"}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button onClick={() => setEditing(expense)} style={styles.iconBtn} title="Edit expense"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(expense.id)} style={{ ...styles.iconBtn, color: "#dc2626" }} title="Delete expense"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.secondaryBtn}>← Prev</button>
                  <span style={{ fontSize: 13, color: "#9b9b9b" }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.secondaryBtn}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>

        <AddExpenseForm budgetId={budgetId} onExpenseAdded={fetchBudget} />
      </div>

      {editing && (
        <EditExpenseModal
          expense={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchBudget(); }}
          budgetId={budgetId}
        />
      )}
      <ConfirmDeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteExpense} message="Delete this expense?" />
      <ConfirmDeleteModal isOpen={showBudgetDel} onClose={() => setShowBudgetDel(false)} onConfirm={handleDeleteBudget} message="Delete this budget and all its expenses? This cannot be undone." />
    </div>
  );
};

const EditExpenseModal = ({ expense, budgetId, onClose, onSaved }) => {
  const [description, setDescription] = useState(expense.description || "");
  const [amount, setAmount] = useState(String(expense.amount || ""));
  const [date, setDate] = useState(expense.date || new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/api/budgets/${budgetId}/expenses/${expense.id}`, {
        description,
        amount: parseFloat(amount),
        date,
      }, { headers: { email: localStorage.getItem("email") } });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update expense");
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <form style={styles.modal} onSubmit={handleSubmit} onClick={event => event.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit Expense</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>x</button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <Field label="Description" value={description} setValue={setDescription} />
        <Field label="Amount (RM)" type="number" value={amount} setValue={setAmount} extra={{ min: "0.01", step: "0.01" }} />
        <Field label="Date" type="date" value={date} setValue={setDate} />
        <button type="submit" style={styles.primaryBtn}>Save Changes</button>
      </form>
    </div>
  );
};

const Field = ({ label, type = "text", value, setValue, extra }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} required onChange={event => setValue(event.target.value)} style={styles.input} {...(extra || {})} />
  </div>
);

const styles = {
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9b9b9b", fontSize: 14 },
  centerColumn: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 },
  backBtn: { background: "none", border: "none", color: "#9b9b9b", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16 },
  budgetIcon: { width: 48, height: 48, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 },
  title: { fontSize: 24, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 13, color: "#9b9b9b", marginTop: 6 },
  deleteBudgetBtn: { padding: "7px 14px", background: "#fff", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, fontSize: 13, cursor: "pointer" },
  progressTrack: { marginTop: 16, height: 6, background: "#f1f1ef", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  card: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, overflow: "hidden" },
  tableHeader: { padding: "16px 20px", borderBottom: "1px solid #e8e8e6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  countPill: { background: "#f1f1ef", borderRadius: 5, padding: "3px 10px", fontSize: 12, color: "#374151", fontWeight: 500 },
  empty: { padding: "48px 0", textAlign: "center", color: "#9b9b9b", fontSize: 13 },
  th: { padding: "10px 20px", fontSize: 11, fontWeight: 600, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" },
  td: { padding: "13px 20px", fontSize: 14, color: "#191919" },
  iconBtn: { background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: 4, borderRadius: 4, marginLeft: 4 },
  pagination: { padding: "12px 20px", borderTop: "1px solid #f1f1ef", display: "flex", justifyContent: "space-between", alignItems: "center" },
  primaryBtn: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  secondaryBtn: { background: "none", border: "1px solid #e8e8e6", color: "#374151", fontSize: 13, padding: "7px 14px", borderRadius: 8, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 600, color: "#191919" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9b9b9b", cursor: "pointer" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", boxSizing: "border-box" },
  error: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
};

export default Expenses;
