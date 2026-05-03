import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { buildInsights, currentMonthKey, flattenExpenses, formatMoney, monthLabel } from "../utils/finance";

const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2", "#7c3aed"];

const Stat = ({ label, value, sub, accent, danger }) => (
  <div style={{ padding: 20, borderRadius: 10, border: "1px solid", borderColor: danger ? "#fecaca" : accent ? "#bfdbfe" : "#e8e8e6", background: danger ? "#fff7f7" : accent ? "#eff6ff" : "#fafaf9" }}>
    <div style={{ fontSize: 12, color: danger ? "#dc2626" : accent ? "#3b82f6" : "#9b9b9b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: danger ? "#dc2626" : accent ? "#1d4ed8" : "#191919", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#9b9b9b", marginTop: 6 }}>{sub}</div>}
  </div>
);

const Card = ({ title, sub, children }) => (
  <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 10, padding: 24, overflow: "hidden" }}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#191919" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#9b9b9b", marginTop: 3 }}>{sub}</div>}
    </div>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e6", borderRadius: 8, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#6b6b6b", marginBottom: 4 }}>{label || payload[0]?.name}</div>
      <div style={{ fontWeight: 600, color: "#191919" }}>{formatMoney(payload[0]?.value || 0)}</div>
    </div>
  );
};

const AiAnalytics = ({ insights, monthlyIncome, monthlyFixed, expectedBalance }) => {
  const fixedRatio = monthlyIncome > 0 ? (monthlyFixed / monthlyIncome) * 100 : 0;
  const status = expectedBalance < 0 || insights.overBudget.length ? "Needs attention" : insights.usage > 75 || fixedRatio > 60 ? "Watch closely" : "Healthy";
  const Icon = insights.overBudget.length ? AlertTriangle : insights.usage > 75 ? TrendingUp : CheckCircle2;
  const cashflowTips = [];
  if (monthlyIncome > 0) {
    cashflowTips.push(`Fixed expenses use ${fixedRatio.toFixed(0)}% of your monthly income.`);
    cashflowTips.push(`Expected balance after fixed bills and flexible spending is ${formatMoney(expectedBalance)}.`);
  } else {
    cashflowTips.push("Add income sources to unlock cashflow advice.");
  }
  const recommendations = [...cashflowTips, ...insights.recommendations];
  return (
    <Card title="AI Analytics" sub="Local spending intelligence based on your current data">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Brain size={20} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#191919" }}>{status}</div>
          <div style={{ fontSize: 12, color: "#9b9b9b" }}>
            {insights.projectionReady
              ? `Projected month-end spend: ${formatMoney(insights.projected)}`
              : `Early-month estimate: ${formatMoney(insights.projected)}`}
          </div>
        </div>
        <Icon size={22} color={insights.overBudget.length ? "#dc2626" : insights.usage > 75 ? "#d97706" : "#059669"} style={{ marginLeft: "auto" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniMetric label="Budget Usage" value={`${insights.usage.toFixed(0)}%`} />
        <MiniMetric label="Top Category" value={insights.topBudget?.name || "None"} />
        <MiniMetric label="Fixed Costs" value={formatMoney(insights.fixedTotal)} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recommendations.map((item) => (
          <div key={item} style={{ padding: "10px 12px", borderRadius: 8, background: "#fafaf9", border: "1px solid #e8e8e6", fontSize: 13, color: "#374151" }}>{item}</div>
        ))}
      </div>
    </Card>
  );
};

const MiniMetric = ({ label, value }) => (
  <div style={{ padding: "10px 12px", border: "1px solid #e8e8e6", borderRadius: 8, background: "#fff" }}>
    <div style={{ fontSize: 11, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: "#191919", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
  </div>
);

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem("name") || "there";
  const key = currentMonthKey();

  useEffect(() => {
    const email = localStorage.getItem("email");
    Promise.all([
      axios.get("/api/budgets", { headers: { email } }),
      axios.get("/api/incomes", { headers: { email } }),
      axios.get("/api/fixed-expenses", { headers: { email } }),
    ])
      .then(([budgetRes, incomeRes, fixedRes]) => {
        setBudgets(Array.isArray(budgetRes.data) ? budgetRes.data : []);
        setIncomes(Array.isArray(incomeRes.data) ? incomeRes.data : []);
        setFixedExpenses(Array.isArray(fixedRes.data) ? fixedRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const insights = buildInsights(budgets, key);
  const monthlyIncome = incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0);
  const monthlyFixed = fixedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expectedBalance = monthlyIncome - monthlyFixed - insights.totalSpent;
  const incomeAfterFixed = monthlyIncome - monthlyFixed;
  const allExpenses = flattenExpenses(budgets);
  const recent = [...allExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const byMonth = allExpenses.reduce((map, expense) => {
    if (!expense.date) return map;
    const d = new Date(expense.date);
    const month = d.toLocaleString("en-MY", { month: "short", year: "numeric" });
    map[month] = (map[month] || 0) + Number(expense.amount || 0);
    return map;
  }, {});
  const barData = Object.entries(byMonth).map(([month, amount]) => ({ month, amount }));
  const pieData = insights.budgetStats.map(budget => ({ name: `${budget.icon || ""} ${budget.name}`.trim(), value: budget.spent })).filter(item => item.value > 0);

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={styles.eyebrow}>Overview</div>
        <h1 style={styles.title}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {name.split(" ")[0]}</h1>
        <p style={styles.subtle}>Here is what is happening with your money in {monthLabel(key)}.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Monthly Income" value={formatMoney(monthlyIncome)} sub={`${incomes.length} income sources`} accent />
        <Stat label="Fixed Expenses" value={formatMoney(monthlyFixed)} sub={`${fixedExpenses.length} recurring items`} />
        <Stat label="Flexible Spent" value={formatMoney(insights.totalSpent)} sub={`${insights.monthExpenses.length} transactions`} />
        <Stat label="Expected Balance" value={formatMoney(expectedBalance)} sub="income - fixed - spending" danger={expectedBalance < 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Monthly Budget" value={formatMoney(insights.totalBudget)} sub={`${budgets.length} budgets`} />
        <Stat label="Remaining" value={formatMoney(insights.remaining)} sub={insights.remaining >= 0 ? "available" : "over budget"} danger={insights.remaining < 0} />
        <Stat
          label="Projected"
          value={formatMoney(insights.projected)}
          sub={insights.projectionReady ? "fixed costs + flexible pace" : "fixed costs + current spending"}
          danger={insights.projected > insights.totalBudget && insights.totalBudget > 0}
        />
        <Stat label="After Fixed Bills" value={formatMoney(incomeAfterFixed)} sub="income left for budgets/goals" danger={incomeAfterFixed < 0} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <AiAnalytics insights={insights} monthlyIncome={monthlyIncome} monthlyFixed={monthlyFixed} expectedBalance={expectedBalance} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card title="Monthly Spending" sub="All recorded expenses">
          {barData.length === 0 ? <div style={styles.emptyChart}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9b9b9b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9b9b9b" }} axisLine={false} tickLine={false} tickFormatter={v => `RM${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f1ef" }} />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="This Month By Category" sub={monthLabel(key)}>
          {pieData.length === 0 ? <div style={styles.emptyChart}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#6b6b6b" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Recent Transactions" sub="Latest 6 expenses across all budgets">
        {recent.length === 0 ? <div style={styles.emptyChart}>No expenses yet. Add one from the Budgets page.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Description", "Budget", "Amount", "Date"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recent.map(expense => (
                <tr key={expense.id} style={{ borderBottom: "1px solid #f1f1ef" }}>
                  <td style={styles.td}>{expense.description}</td>
                  <td style={styles.td}><span style={styles.pill}>{expense.budgetIcon} {expense.budgetName}</span></td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>{formatMoney(expense.amount)}</td>
                  <td style={{ ...styles.td, textAlign: "right", color: "#9b9b9b" }}>{expense.date ? new Date(expense.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

const styles = {
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9b9b9b", fontSize: 14 },
  eyebrow: { fontSize: 11, color: "#9b9b9b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 28, fontWeight: 700, color: "#191919", margin: 0 },
  subtle: { fontSize: 14, color: "#6b6b6b", marginTop: 6 },
  emptyChart: { height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9b9b9b", fontSize: 13 },
  th: { padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left", borderBottom: "1px solid #e8e8e6" },
  td: { padding: "12px 12px", fontSize: 14, color: "#191919" },
  pill: { background: "#f1f1ef", borderRadius: 5, padding: "3px 8px", fontSize: 12, color: "#374151" },
};

export default Dashboard;
