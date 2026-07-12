import React from 'react';
import { useExecutiveDashboard } from '../hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { Activity, Truck, DollarSign, Wrench } from 'lucide-react';

const ExecutiveDashboardPage = () => {
  const { data: dashboardData, isLoading } = useExecutiveDashboard();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Business Intelligence...</div>;
  }

  const { fleet, trips, finance, maintenance, fuel } = dashboardData?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
          <p className="text-slate-600">High-level Business Intelligence & KPIs</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Fleet Utilization</p>
            <Truck size={18} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{fleet?.utilization}%</h3>
          <p className="text-xs text-slate-500 mt-1">{fleet?.active} Active Vehicles</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Trip Success Rate</p>
            <Activity size={18} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{trips?.successRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">{trips?.total} Total Trips</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Operating Cost</p>
            <DollarSign size={18} className="text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">${finance?.totalOperatingCost?.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Total Ledger Expenses</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">Prev. Maintenance Ratio</p>
            <Wrench size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{maintenance?.prevRatio}%</h3>
          <p className="text-xs text-slate-500 mt-1">Preventive vs Corrective</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Financial Trend */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Expense Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={finance?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Expenses']}
                />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Expense Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finance?.categoryBreakdown || []} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;
