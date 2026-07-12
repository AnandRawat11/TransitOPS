import api from './axios';

export const getExpenses = async (filters = {}) => {
  const { vehicleId, type } = filters;
  let url = '/expenses';
  const params = [];
  if (vehicleId) params.push(`vehicleId=${vehicleId}`);
  if (type) params.push(`type=${type}`);
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const response = await api.get(url);
  return response.data;
};

export const createExpense = async (data) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};
