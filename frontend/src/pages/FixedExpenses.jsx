import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "../utils/finance";

const emptyForm = { name: "", amount: "", category: "Housing", dueDay: "1", recurring: true };

const FixedExpenses = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    const email = localStorage.getItem("email");
    const r = await axios.get("/api/fixed-expenses", { headers: { email } });
    setItems(Array.isArray(r.data) ? r.data : []);
  };

  useEffect(() => { fetch().catch(console.error); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const email = localStorage.getItem("email");
    const payload = { ...form, amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay, 10), recurring: Boolean(form.recurring) };
    if (editing) await axios.put(`/api/fixed-expenses/${editing.id}`, payload, { headers: { email } });
    else await axios.post("/api/fixed-expenses", payload, { headers: { email } });
    setForm(emptyForm);
    setEditing(null);
    fetch();
  };

  const edit = (item) => {
    setEditing(item);
    setForm({ name: item.name || "", amount: String(item.amount || ""), category: item.category || "Bills", dueDay: String(item.dueDay || 1), recurring: item.recurring !== false });
  };

  const remove = async (id) => {
    await axios.delete(`/api/fixed-expenses/${id}`, { headers: { email: localStorage.getItem("email") } });
    fetch();
  };

  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={styles.eyebrow}>Cashflow</div>
        <h1 style={styles.title}>Fixed Expenses</h1>
        <p style={styles.subtle}>Track bills that repeat every month, separate from flexible spending.</p>
      </div>

      <div style={styles.summary}>
        <div>
          <div style={styles.summaryLabel}>Monthly Fixed Expenses</div>
          <div style={styles.summaryValue}>{formatMoney(total)}</div>
        </div>
        <div style={{ color: "#9b9b9b", fontSize: 13 }}>{items.length} recurring items</div>
      </div>

      <div style={styles.layout}>
        <div style={styles.card}>
          {items.length === 0 ? <div style={styles.empty}>No fixed expenses added yet.</div> : items.map(item => (
            <div key={item.id} style={styles.row}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#191919" }}>{item.name}</div>
                <div style={styles.subtle}>{item.category || "Bills"} · due day {item.dueDay || "-"}</div>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 800 }}>{formatMoney(item.amount)}</div>
              <button onClick={() => edit(item)} style={styles.iconBtn}><Pencil size={14} /></button>
              <button onClick={() => remove(item.id)} style={{ ...styles.iconBtn, color: "#dc2626" }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={submit} style={styles.formCard}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#191919", marginBottom: 18 }}>{editing ? "Edit Fixed Expense" : "Add Fixed Expense"}</div>
          <Field label="Name" value={form.name} setValue={value => setForm({ ...form, name: value })} placeholder="Rent" />
          <Field label="Amount (RM)" type="number" value={form.amount} setValue={value => setForm({ ...form, amount: value })} placeholder="1200" />
          <Field label="Category" value={form.category} setValue={value => setForm({ ...form, category: value })} placeholder="Housing" />
          <Field label="Due Day" type="number" value={form.dueDay} setValue={value => setForm({ ...form, dueDay: value })} placeholder="1" />
          <label style={styles.checkRow}><input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} /> Recurring monthly</label>
          <button type="submit" style={styles.primaryBtn}>Save Fixed Expense</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} style={styles.secondaryBtn}>Cancel</button>}
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, setValue, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} required onChange={e => setValue(e.target.value)} placeholder={placeholder} style={styles.input} />
  </div>
);

const styles = {
  eyebrow: { fontSize: 11, color: "#9b9b9b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 28, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 13, color: "#9b9b9b", marginTop: 4 },
  summary: { padding: 20, border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  summaryLabel: { fontSize: 12, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
  summaryValue: { fontSize: 24, color: "#1d4ed8", fontWeight: 800, marginTop: 6 },
  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 },
  card: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, overflow: "hidden" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid #f1f1ef" },
  empty: { padding: 48, textAlign: "center", color: "#9b9b9b", fontSize: 13 },
  iconBtn: { border: "1px solid #e8e8e6", background: "#fff", color: "#6b6b6b", width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  formCard: { background: "#fafaf9", border: "1px solid #e8e8e6", borderRadius: 10, padding: 24, height: "fit-content" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", boxSizing: "border-box", background: "#fff" },
  checkRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 16 },
  primaryBtn: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  secondaryBtn: { width: "100%", padding: 10, background: "#fff", color: "#374151", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, marginTop: 8, cursor: "pointer" },
};

export default FixedExpenses;
