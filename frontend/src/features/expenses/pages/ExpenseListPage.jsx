import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useExpenses, useUpdateApprovalStatus } from '../hooks/useExpenses';
import { useAuth } from '../../../context/AuthContext';

const ExpenseListPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useExpenses({ page, limit: 10, search });
  const approveMutation = useUpdateApprovalStatus();

  const handleApprove = (id) => {
    approveMutation.mutate({ id, approvalData: { approvalStatus: 'APPROVED' } });
  };

  const handleReject = (id) => {
    approveMutation.mutate({ id, approvalData: { approvalStatus: 'REJECTED' } });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800/50">Approved</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-800/50">Rejected</span>;
      default: return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800/50">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Expense Ledger</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and approve operational expenses</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search expenses by number, title, vendor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Expense #</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full mb-2"></div>
                    <p>Loading expenses...</p>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                data?.data?.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{exp.expenseNumber}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{exp.title}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{exp.expenseCategory}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">${exp.amount.toFixed(2)}</td>
                    <td className="p-4">{getStatusBadge(exp.approvalStatus)}</td>
                    <td className="p-4">
                      {exp.approvalStatus === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'FINANCIAL_ANALYST') ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(exp.id)} className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(exp.id)} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseListPage;
