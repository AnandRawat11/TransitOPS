import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../services/expenseApi';
import toast from 'react-hot-toast';

export const EXPENSE_KEYS = {
  all: ['expenses'],
  lists: () => [...EXPENSE_KEYS.all, 'list'],
  list: (filters) => [...EXPENSE_KEYS.lists(), { filters }],
  details: () => [...EXPENSE_KEYS.all, 'detail'],
  detail: (id) => [...EXPENSE_KEYS.details(), id],
  financeSummary: ['finance', 'summary'],
  financeAnalytics: ['finance', 'analytics']
};

export const useExpenses = (filters) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(filters),
    queryFn: () => expenseApi.getExpenses(filters),
    keepPreviousData: true,
  });
};

export const useExpense = (id) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.detail(id),
    queryFn: () => expenseApi.getExpenseById(id),
    enabled: !!id,
  });
};

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: EXPENSE_KEYS.financeSummary,
    queryFn: () => expenseApi.getFinanceSummary(),
  });
};

export const useFinanceAnalytics = () => {
  return useQuery({
    queryKey: EXPENSE_KEYS.financeAnalytics,
    queryFn: () => expenseApi.getFinanceAnalytics(),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: expenseApi.createExpense,
    onSuccess: () => {
      toast.success('Expense record created successfully');
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    },
  });
};

export const useUpdateApprovalStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvalData }) => expenseApi.updateApprovalStatus(id, approvalData),
    onSuccess: (data, variables) => {
      toast.success(`Expense ${variables.approvalData.approvalStatus.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update approval status');
    },
  });
};
