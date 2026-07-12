import api from './axios';

export const getExpenses = async () => {
  const response = await api.get('/expenses');
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};
