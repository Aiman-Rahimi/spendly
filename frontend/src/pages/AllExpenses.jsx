import React, { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios";
import { Download, Pencil, Trash2 } from "lucide-react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { formatMoney } from "../utils/finance";

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const PER_PAGE = 12;

  const fetch = async () => {
    try {
      const email = localStorage.getItem("email");
      const r = await axios.get("/api/expenses", { headers: { email } });
      const sorted = (Array.isArray(r.data) ? r.data : []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sorted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetch(); }, []);

  const budgetOptions = useMemo(() => {
    const map = new Map();
    expenses.forEach(expense => {
      if (expense.budget?.id) map.set(expense.budget.id, `${expense.budget.icon || ""} ${expense.budget.name}`.trim());
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [expenses]);

  const filtered = expenses.filter(expense => {
    const matchesSearch = !search || expense.description?.toLowerCase().includes(search.toLowerCase()) || expense.budget?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesBudget = budgetFilter === "all" || String(expense.budget?.id) === budgetFilter;
    const matchesFrom = !from || expense.date >= from;
    const matchesTo = !to || expense.date <= to;
    return matchesSearch && matchesBudget && matchesFrom && matchesTo;
  });

  const total = filtered.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    await axios.delete(`/api/expenses/${deleteId}`, { headers: { email: localStorage.getItem("email") } });
    setDeleteId(null);
    fetch();
  };

  const exportCsv = () => {
    const rows = [["Budget", "Description", "Amount", "Date"], ...filtered.map(expense => [
      expense.budget?.name || "",
      expense.description || "",
      Number(expense.amount || 0).toFixed(2),
      expense.date || "",
    ])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spendly-expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={styles.eyebrow}>Finance</div>
        <h1 style={styles.title}>All Expenses</h1>
        <p style={styles.subtle}>Search, filter, edit, and export your transaction history</p>
      </div>

      <div style={styles.toolbar}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Summary label="Total" value={formatMoney(total)} accent />
          <Summary label="Transactions" value={filtered.length} />
        </div>
        <button onClick={exportCsv} style={styles.exportBtn}><Download size={15} /> Export CSV</button>
      </div>

      <div style={styles.filters}>
        <input type="text" placeholder="Search expenses" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={styles.input} />
        <select value={budgetFilter} onChange={e => { setBudgetFilter(e.target.value); setPage(1); }} style={styles.input}>
          <option value="all">All budgets</option>
          {budgetOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} style={styles.input} />
        <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} style={styles.input} />
      </div>

      <div style={styles.card}>
        {current.length === 0 ? (
          <div style={styles.empty}>{search || budgetFilter !== "all" || from || to ? "No results found" : "No expenses yet"}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafaf9" }}>{["Budget", "Description", "Amount", "Date", ""].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {current.map(expense => (
                <tr key={expense.id} style={{ borderTop: "1px solid #f1f1ef" }}>
                  <td style={styles.td}><span style={styles.pill}>{expense.budget?.icon} {expense.budget?.name || "-"}</span></td>
                  <td style={styles.td}>{expense.description}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>{formatMoney(expense.amount)}</td>
                  <td style={{ ...styles.td, textAlign: "right", color: "#9b9b9b" }}>{expense.date ? new Date(expense.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button onClick={() => setEditing(expense)} style={styles.iconBtn} title="Edit expense"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(expense.id)} style={{ ...styles.iconBtn, color: "#dc2626" }} title="Delete expense"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>← Prev</button>
            <span style={{ fontSize: 13, color: "#9b9b9b" }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.pageBtn}>Next →</button>
          </div>
        )}
      </div>

      {editing && <EditExpenseModal expense={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetch(); }} />}
      <ConfirmDeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Delete this expense?" />
    </div>
  );
};

const Summary = ({ label, value, accent }) => (
  <div style={{ padding: "10px 16px", background: accent ? "#eff6ff" : "#fafaf9", borderRadius: 8, border: `1px solid ${accent ? "#bfdbfe" : "#e8e8e6"}` }}>
    <div style={{ fontSize: 11, color: accent ? "#3b82f6" : "#9b9b9b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: accent ? "#1d4ed8" : "#191919" }}>{value}</div>
  </div>
);

const EditExpenseModal = ({ expense, onClose, onSaved }) => {
  const [description, setDescription] = useState(expense.description || "");
  const [amount, setAmount] = useState(String(expense.amount || ""));
  const [date, setDate] = useState(expense.date || new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/api/expenses/${expense.id}`, { description, amount: parseFloat(amount), date }, { headers: { email: localStorage.getItem("email") } });
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
  eyebrow: { fontSize: 11, color: "#9b9b9b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 28, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 14, color: "#6b6b6b", marginTop: 6 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 },
  filters: { display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr", gap: 10, marginBottom: 20 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", background: "#fff", outline: "none", boxSizing: "border-box" },
  exportBtn: { display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "#fff", border: "1px solid #e8e8e6", borderRadius: 8, color: "#374151", cursor: "pointer", fontSize: 13 },
  card: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, overflow: "hidden" },
  empty: { padding: "60px 0", textAlign: "center", color: "#9b9b9b", fontSize: 13 },
  th: { padding: "10px 20px", fontSize: 11, fontWeight: 600, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", whiteSpace: "nowrap" },
  td: { padding: "13px 20px", fontSize: 14, color: "#191919" },
  pill: { background: "#f1f1ef", borderRadius: 5, padding: "3px 8px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" },
  iconBtn: { background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: 4, borderRadius: 4, marginLeft: 4 },
  pagination: { padding: "12px 20px", borderTop: "1px solid #f1f1ef", display: "flex", justifyContent: "space-between", alignItems: "center" },
  pageBtn: { background: "none", border: "1px solid #e8e8e6", color: "#374151", fontSize: 13, padding: "5px 12px", borderRadius: 6, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 600, color: "#191919" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9b9b9b", cursor: "pointer" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  primaryBtn: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  error: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
};

export default AllExpenses;
