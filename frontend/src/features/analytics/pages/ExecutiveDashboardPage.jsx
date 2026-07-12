import React from 'react';
import { useExecutiveDashboard } from '../hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { Activity, Truck, DollarSign, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardSkeleton } from '@/components/ui/Skeleton';

const ExecutiveDashboardPage = () => {
  const { data: dashboardData, isLoading } = useExecutiveDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
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
        {[
          { title: "Fleet Utilization", val: `${fleet?.utilization}%`, sub: `${fleet?.active} Active Vehicles`, icon: Truck, color: "text-blue-500" },
          { title: "Trip Success Rate", val: `${trips?.successRate}%`, sub: `${trips?.total} Total Trips`, icon: Activity, color: "text-green-500" },
          { title: "Operating Cost", val: `$${finance?.totalOperatingCost?.toLocaleString()}`, sub: "Total Ledger Expenses", icon: DollarSign, color: "text-rose-500" },
          { title: "Prev. Maintenance Ratio", val: `${maintenance?.preventativeRatio}%`, sub: "Scheduled vs Reactive", icon: Wrench, color: "text-amber-500" }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <Icon size={64} className={kpi.color} />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                <Icon size={18} className={kpi.color} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 relative z-10">{kpi.val}</h3>
              <p className="text-xs text-slate-500 mt-1 relative z-10">{kpi.sub}</p>
            </motion.div>
          );
        })}
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
