import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "../utils/finance";

const emptyForm = { name: "", amount: "", type: "fixed", recurring: true, receivedDate: new Date().toISOString().split("T")[0] };

const Income = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    const email = localStorage.getItem("email");
    const r = await axios.get("/api/incomes", { headers: { email } });
    setItems(Array.isArray(r.data) ? r.data : []);
  };

  useEffect(() => { fetch().catch(console.error); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const email = localStorage.getItem("email");
    const payload = { ...form, amount: parseFloat(form.amount), recurring: Boolean(form.recurring) };
    if (editing) await axios.put(`/api/incomes/${editing.id}`, payload, { headers: { email } });
    else await axios.post("/api/incomes", payload, { headers: { email } });
    setForm(emptyForm);
    setEditing(null);
    fetch();
  };

  const edit = (item) => {
    setEditing(item);
    setForm({ name: item.name || "", amount: String(item.amount || ""), type: item.type || "fixed", recurring: item.recurring !== false, receivedDate: item.receivedDate || emptyForm.receivedDate });
  };

  const remove = async (id) => {
    await axios.delete(`/api/incomes/${id}`, { headers: { email: localStorage.getItem("email") } });
    fetch();
  };

  const fixed = items.filter(item => item.type === "fixed").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const extra = items.filter(item => item.type !== "fixed").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header title="Income" sub="Track fixed income and extra money coming in." />
      <div style={styles.summaryGrid}>
        <Summary label="Fixed Income" value={formatMoney(fixed)} accent />
        <Summary label="Extra Income" value={formatMoney(extra)} />
        <Summary label="Total Monthly Income" value={formatMoney(fixed + extra)} />
      </div>
      <div style={styles.layout}>
        <List items={items} edit={edit} remove={remove} />
        <Form title={editing ? "Edit Income" : "Add Income"} form={form} setForm={setForm} submit={submit} cancel={() => { setEditing(null); setForm(emptyForm); }} />
      </div>
    </div>
  );
};

const Header = ({ title, sub }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={styles.eyebrow}>Cashflow</div>
    <h1 style={styles.title}>{title}</h1>
    <p style={styles.subtle}>{sub}</p>
  </div>
);

const Summary = ({ label, value, accent }) => (
  <div style={{ ...styles.summary, borderColor: accent ? "#bfdbfe" : "#e8e8e6", background: accent ? "#eff6ff" : "#fafaf9" }}>
    <div style={{ fontSize: 11, color: accent ? "#3b82f6" : "#9b9b9b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: accent ? "#1d4ed8" : "#191919", marginTop: 6 }}>{value}</div>
  </div>
);

const List = ({ items, edit, remove }) => (
  <div style={styles.card}>
    {items.length === 0 ? <div style={styles.empty}>No income added yet.</div> : items.map(item => (
      <div key={item.id} style={styles.row}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#191919" }}>{item.name}</div>
          <div style={styles.subtle}>{item.type === "fixed" ? "Fixed income" : "Extra income"} · {item.recurring ? "recurring" : "one-time"}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontWeight: 800, color: "#191919" }}>{formatMoney(item.amount)}</div>
          <div style={styles.subtle}>{item.receivedDate || "-"}</div>
        </div>
        <button onClick={() => edit(item)} style={styles.iconBtn}><Pencil size={14} /></button>
        <button onClick={() => remove(item.id)} style={{ ...styles.iconBtn, color: "#dc2626" }}><Trash2 size={14} /></button>
      </div>
    ))}
  </div>
);

const Form = ({ title, form, setForm, submit, cancel }) => (
  <form onSubmit={submit} style={styles.formCard}>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#191919", marginBottom: 18 }}>{title}</div>
    <Field label="Name" value={form.name} setValue={value => setForm({ ...form, name: value })} placeholder="Salary" />
    <Field label="Amount (RM)" type="number" value={form.amount} setValue={value => setForm({ ...form, amount: value })} placeholder="3200" />
    <label style={styles.label}>Type</label>
    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={styles.input}>
      <option value="fixed">Fixed income</option>
      <option value="extra">Extra income</option>
    </select>
    <Field label="Date Received" type="date" value={form.receivedDate} setValue={value => setForm({ ...form, receivedDate: value })} />
    <label style={styles.checkRow}><input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} /> Recurring monthly</label>
    <button type="submit" style={styles.primaryBtn}>Save Income</button>
    {title.startsWith("Edit") && <button type="button" onClick={cancel} style={styles.secondaryBtn}>Cancel</button>}
  </form>
);

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
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  summary: { padding: 18, border: "1px solid", borderRadius: 10 },
  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 },
  card: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, overflow: "hidden" },
  row: { display: "flex", alignItems: "center", gap: 12, padding: 16, borderBottom: "1px solid #f1f1ef" },
  empty: { padding: 48, textAlign: "center", color: "#9b9b9b", fontSize: 13 },
  iconBtn: { border: "1px solid #e8e8e6", background: "#fff", color: "#6b6b6b", width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  formCard: { background: "#fafaf9", border: "1px solid #e8e8e6", borderRadius: 10, padding: 24, height: "fit-content" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", boxSizing: "border-box", background: "#fff", marginBottom: 14 },
  checkRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 16 },
  primaryBtn: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  secondaryBtn: { width: "100%", padding: 10, background: "#fff", color: "#374151", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, marginTop: 8, cursor: "pointer" },
};

export default Income;
