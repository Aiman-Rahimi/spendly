import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import CreateBudgetForm from "../components/CreateBudgetForm";
import { formatMoney, spentForBudget } from "../utils/finance";

const DEFAULT_ICON = "\uD83D\uDCB0";

const BudgetCard = ({ budget, onClick, onEdit }) => {
  const spent = spentForBudget(budget);
  const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const over = spent > budget.amount;

  return (
    <div onClick={onClick} style={styles.budgetCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.icon}>{budget.icon || DEFAULT_ICON}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#191919" }}>{budget.name}</div>
            <div style={{ fontSize: 12, color: "#9b9b9b", marginTop: 2 }}>{(budget.expenses || []).length} transactions</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: over ? "#dc2626" : "#191919" }}>{formatMoney(spent)}</div>
            <div style={{ fontSize: 11, color: "#9b9b9b" }}>of {formatMoney(budget.amount)}</div>
          </div>
          <button onClick={(event) => { event.stopPropagation(); onEdit(); }} style={styles.iconButton} title="Edit budget">
            <Pencil size={14} />
          </button>
        </div>
      </div>
      <div style={{ height: 4, background: "#f1f1ef", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: over ? "#dc2626" : pct > 80 ? "#d97706" : "#2563eb", borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 11, color: "#9b9b9b", marginTop: 8 }}>{pct.toFixed(0)}% used this month</div>
    </div>
  );
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const email = localStorage.getItem("email");
      const r = await axios.get("/api/budgets", { headers: { email } });
      setBudgets(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div style={styles.eyebrow}>Finance</div>
          <h1 style={styles.pageTitle}>Budgets</h1>
          <p style={styles.subtle}>Manage this month's spending categories</p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.createBtn}>+ New Budget</button>
      </div>

      {budgets.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 8 }}>No budgets yet</div>
          <div style={{ fontSize: 14, color: "#9b9b9b", marginBottom: 20 }}>Create your first budget to start tracking expenses</div>
          <button onClick={() => setShowForm(true)} style={styles.createBtn}>Create Budget</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onClick={() => navigate(`/budgets/${budget.id}/expenses`)}
              onEdit={() => setEditing(budget)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>New Budget</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>x</button>
            </div>
            <CreateBudgetForm onSuccess={() => { setShowForm(false); fetch(); }} />
          </div>
        </div>
      )}

      {editing && (
        <div style={styles.overlay} onClick={() => setEditing(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Budget</h2>
              <button onClick={() => setEditing(null)} style={styles.closeBtn}>x</button>
            </div>
            <EditBudgetForm budget={editing} onSuccess={() => { setEditing(null); fetch(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const EditBudgetForm = ({ budget, onSuccess }) => {
  const [name, setName] = useState(budget.name || "");
  const [amount, setAmount] = useState(String(budget.amount || ""));
  const [icon, setIcon] = useState(budget.icon || DEFAULT_ICON);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const now = new Date();
      await axios.put(`/api/budgets/${budget.id}`, {
        name,
        icon,
        amount: parseFloat(amount),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }, { headers: { email: localStorage.getItem("email") } });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={styles.error}>{error}</div>}
      <div style={styles.field}>
        <label style={styles.label}>Icon</label>
        <input value={icon} maxLength={4} onChange={e => setIcon(e.target.value)} style={styles.input} />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Budget Name</label>
        <input value={name} required onChange={e => setName(e.target.value)} style={styles.input} />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Amount (RM)</label>
        <input type="number" value={amount} required min="1" step="0.01" onChange={e => setAmount(e.target.value)} style={styles.input} />
      </div>
      <button type="submit" disabled={saving} style={{ ...styles.createBtn, width: "100%", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

const styles = {
  eyebrow: { fontSize: 11, color: "#9b9b9b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 14, color: "#6b6b6b", marginTop: 6 },
  createBtn: { padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" },
  budgetCard: { padding: 20, background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, cursor: "pointer" },
  icon: { width: 36, height: 36, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  iconButton: { width: 28, height: 28, border: "1px solid #e8e8e6", background: "#fff", color: "#6b6b6b", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  empty: { textAlign: "center", padding: "80px 0", color: "#9b9b9b" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" },
  modal: { background: "#fff", borderRadius: 12, padding: "28px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 600, color: "#191919" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9b9b9b", cursor: "pointer", padding: "4px 8px", borderRadius: 4 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", boxSizing: "border-box" },
  error: { background: "#fff0f0", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 },
};

export default Budgets;
