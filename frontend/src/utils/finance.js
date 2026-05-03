export const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

export const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const expenseMonthKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key) => {
  if (!key) return "";
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-MY", { month: "short", year: "numeric" });
};

export const spentForBudget = (budget, key = currentMonthKey()) =>
  (budget.expenses || [])
    .filter((expense) => expenseMonthKey(expense.date) === key)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

export const flattenExpenses = (budgets) =>
  budgets.flatMap((budget) =>
    (budget.expenses || []).map((expense) => ({
      ...expense,
      budgetId: budget.id,
      budgetName: budget.name,
      budgetIcon: budget.icon,
      budgetAmount: budget.amount,
    }))
  );

export const buildInsights = (budgets, key = currentMonthKey()) => {
  const monthExpenses = flattenExpenses(budgets).filter((expense) => expenseMonthKey(expense.date) === key);
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0);
  const totalSpent = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const today = new Date();
  const isCurrentMonth = key === currentMonthKey();
  const dayOfMonth = isCurrentMonth ? today.getDate() : new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 0).getDate();
  const daysInMonth = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 0).getDate();
  const fixedKeywords = ["rent", "rental", "loan", "mortgage", "subscription", "insurance"];
  const fixedExpenses = monthExpenses.filter((expense) => {
    const label = `${expense.budgetName || ""} ${expense.description || ""}`.toLowerCase();
    const looksFixed = fixedKeywords.some((word) => label.includes(word));
    const isLargeBudgetShare = Number(expense.budgetAmount || 0) > 0 && Number(expense.amount || 0) >= Number(expense.budgetAmount || 0) * 0.8;
    return looksFixed || isLargeBudgetShare;
  });
  const fixedTotal = fixedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const flexibleSpent = Math.max(0, totalSpent - fixedTotal);
  const projectedFlexible = isCurrentMonth && dayOfMonth >= 3 ? (flexibleSpent / dayOfMonth) * daysInMonth : flexibleSpent;
  const projected = fixedTotal + projectedFlexible;
  const usage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const budgetStats = budgets.map((budget) => {
    const spent = spentForBudget(budget, key);
    const amount = Number(budget.amount || 0);
    return {
      ...budget,
      spent,
      remaining: amount - spent,
      usage: amount > 0 ? (spent / amount) * 100 : 0,
    };
  });

  const overBudget = budgetStats.filter((budget) => budget.usage > 100);
  const nearLimit = budgetStats.filter((budget) => budget.usage >= 80 && budget.usage <= 100);
  const topBudget = [...budgetStats].sort((a, b) => b.spent - a.spent)[0];
  const biggestExpense = [...monthExpenses].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];

  const recommendations = [];
  if (overBudget.length) {
    recommendations.push(`Reduce spending in ${overBudget.map((budget) => budget.name).join(", ")}; it is already over budget.`);
  }
  if (nearLimit.length) {
    recommendations.push(`${nearLimit.map((budget) => budget.name).join(", ")} is close to the limit. Slow down for the rest of ${monthLabel(key)}.`);
  }
  if (projected > totalBudget && totalBudget > 0) {
    recommendations.push(`At the current pace, month-end spend may reach ${formatMoney(projected)}, above your budget.`);
  }
  if (!recommendations.length && totalSpent > 0) {
    recommendations.push("Spending is under control this month. Keep tracking small daily expenses.");
  }
  if (!monthExpenses.length) {
    recommendations.push("No expenses logged for this month yet. Add transactions to unlock useful insights.");
  }

  return {
    monthExpenses,
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    projected,
    fixedTotal,
    flexibleSpent,
    projectionReady: !isCurrentMonth || dayOfMonth >= 3,
    usage,
    budgetStats,
    overBudget,
    nearLimit,
    topBudget,
    biggestExpense,
    recommendations,
  };
};
