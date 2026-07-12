import api from '../../../services/api';

export const expenseApi = {
  getExpenses: async (params) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  updateApprovalStatus: async (id, approvalData) => {
    // approvalData: { approvalStatus: 'APPROVED' | 'REJECTED', remarks: string }
    const response = await api.patch(`/expenses/${id}/approve`, approvalData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getFinanceSummary: async () => {
    const response = await api.get('/dashboard/finance/summary');
    return response.data;
  },

  getFinanceAnalytics: async () => {
    const response = await api.get('/dashboard/finance/analytics');
    return response.data;
  }
};
