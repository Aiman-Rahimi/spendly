import React, { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatMoney } from "../utils/finance";

const storageKey = () => `spendly-goals-${localStorage.getItem("userId") || "guest"}`;

const loadGoals = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey()) || "[]");
  } catch {
    return [];
  }
};

const saveGoals = (goals) => localStorage.setItem(storageKey(), JSON.stringify(goals));

const Goals = () => {
  const [goals, setGoals] = useState(loadGoals);
  const [form, setForm] = useState({ name: "", target: "", saved: "", deadline: "" });

  const totals = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
    const saved = goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0);
    return { target, saved, pct: target > 0 ? Math.min((saved / target) * 100, 100) : 0 };
  }, [goals]);

  const updateGoals = (next) => {
    setGoals(next);
    saveGoals(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = [{
      id: Date.now(),
      name: form.name,
      target: Number(form.target || 0),
      saved: Number(form.saved || 0),
      deadline: form.deadline,
    }, ...goals];
    updateGoals(next);
    setForm({ name: "", target: "", saved: "", deadline: "" });
  };

  const updateSaved = (id, saved) => {
    updateGoals(goals.map(goal => goal.id === id ? { ...goal, saved: Number(saved || 0) } : goal));
  };

  const removeGoal = (id) => updateGoals(goals.filter(goal => goal.id !== id));

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={styles.eyebrow}>Planning</div>
        <h1 style={styles.title}>Goals</h1>
        <p style={styles.subtle}>Track savings targets beside your daily spending.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        <div>
          <div style={styles.summary}>
            <div>
              <div style={styles.summaryLabel}>Total Progress</div>
              <div style={styles.summaryValue}>{formatMoney(totals.saved)} / {formatMoney(totals.target)}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#2563eb" }}>{totals.pct.toFixed(0)}%</div>
          </div>
          <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${totals.pct}%` }} /></div>

          <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
            {goals.length === 0 ? (
              <div style={styles.empty}>No goals yet. Add a target to start planning.</div>
            ) : goals.map(goal => {
              const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
              const deadline = goal.deadline ? new Date(goal.deadline) : null;
              const monthsLeft = deadline ? Math.max(1, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24 * 30))) : 0;
              const needed = Math.max(0, goal.target - goal.saved);
              return (
                <div key={goal.id} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#191919" }}>{goal.name}</div>
                      <div style={styles.subtle}>{goal.deadline ? `Deadline ${new Date(goal.deadline).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}` : "No deadline"}</div>
                    </div>
                    <button onClick={() => removeGoal(goal.id)} style={styles.iconBtn} title="Delete goal"><Trash2 size={15} /></button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13, color: "#374151" }}>
                    <span>{formatMoney(goal.saved)} saved</span>
                    <span>{formatMoney(goal.target)} target</span>
                  </div>
                  <div style={styles.smallTrack}><div style={{ ...styles.smallFill, width: `${pct}%` }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                    <label style={styles.inlineLabel}>Saved now
                      <input type="number" min="0" step="0.01" value={goal.saved} onChange={e => updateSaved(goal.id, e.target.value)} style={styles.input} />
                    </label>
                    <div style={styles.recommendation}>{monthsLeft ? `${formatMoney(needed / monthsLeft)} / month needed` : `${formatMoney(needed)} remaining`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Plus size={18} color="#2563eb" />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#191919" }}>New Goal</div>
          </div>
          <Field label="Goal Name" value={form.name} setValue={value => setForm({ ...form, name: value })} placeholder="Emergency fund" />
          <Field label="Target (RM)" type="number" value={form.target} setValue={value => setForm({ ...form, target: value })} placeholder="5000" />
          <Field label="Saved Now (RM)" type="number" value={form.saved} setValue={value => setForm({ ...form, saved: value })} placeholder="800" />
          <Field label="Deadline" type="date" value={form.deadline} setValue={value => setForm({ ...form, deadline: value })} />
          <button type="submit" style={styles.primaryBtn}>Create Goal</button>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, setValue, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} required onChange={event => setValue(event.target.value)} placeholder={placeholder} style={styles.input} />
  </div>
);

const styles = {
  eyebrow: { fontSize: 11, color: "#9b9b9b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 28, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 13, color: "#9b9b9b", marginTop: 6 },
  summary: { padding: 20, border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 12, color: "#3b82f6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },
  summaryValue: { fontSize: 22, color: "#1d4ed8", fontWeight: 800, marginTop: 6 },
  progressTrack: { height: 8, background: "#f1f1ef", borderRadius: 4, overflow: "hidden", marginTop: 12 },
  progressFill: { height: "100%", background: "#2563eb" },
  card: { background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, padding: 18 },
  empty: { border: "1px dashed #d6d3d1", borderRadius: 10, padding: 40, color: "#9b9b9b", textAlign: "center", fontSize: 13 },
  smallTrack: { height: 6, background: "#f1f1ef", borderRadius: 3, overflow: "hidden", marginTop: 8 },
  smallFill: { height: "100%", background: "#059669" },
  inlineLabel: { fontSize: 12, color: "#6b6b6b", display: "flex", flexDirection: "column", gap: 6 },
  recommendation: { background: "#fafaf9", border: "1px solid #e8e8e6", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#374151", display: "flex", alignItems: "center" },
  formCard: { background: "#fafaf9", border: "1px solid #e8e8e6", borderRadius: 10, padding: 24, height: "fit-content" },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e8e8e6", borderRadius: 8, fontSize: 14, color: "#191919", outline: "none", boxSizing: "border-box", background: "#fff" },
  primaryBtn: { width: "100%", padding: 10, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
  iconBtn: { border: "1px solid #fecaca", background: "#fff", color: "#dc2626", width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
};

export default Goals;
