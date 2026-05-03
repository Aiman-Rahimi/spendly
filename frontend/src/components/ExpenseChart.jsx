import React, { useEffect, useState } from "react";
import "./ExpenseChart.css";
import axios from "../utils/axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF", "#FF6666"];

const ExpenseChart = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/expenses/user/1")
      .then(res => {
        const grouped = groupByCategory(res.data);
        setExpenses(grouped);
      })
      .catch(err => console.error("Error fetching expenses:", err));
  }, []);

  const groupByCategory = (data) => {
    const grouped = {};
    data.forEach(item => {
      grouped[item.category] = (grouped[item.category] || 0) + item.amount;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="chart-container">
      <h2>Expenses by Category</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={expenses}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {expenses.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default ExpenseChart;
