import React, { useEffect, useState } from 'react';
import { getExpensesByUser } from '../services/expenseService';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        getExpensesByUser(1).then(response => {
            setExpenses(response.data);
        });
    }, []);

    return (
        <div>
            <h2>Expenses</h2>
            <ul>
                {expenses.map(exp => (
                    <li key={exp.id}>
                        {exp.date} - {exp.description} - ${exp.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseList;
