import axios from 'axios';

const API_BASE_URL = 'https://spendly-production-bfcb.up.railway.app/api/expenses';

export const getExpensesByUser = (userId) => {
    return axios.get(`${API_BASE_URL}/user/${userId}`);
};

export const createExpense = (expense) => {
    return axios.post(API_BASE_URL, expense);
};
