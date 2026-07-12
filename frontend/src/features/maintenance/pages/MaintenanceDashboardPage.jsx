import React from 'react';
import { motion } from 'framer-motion';
import { useMaintenanceDashboardSummary, useMaintenanceDashboardAnalytics } from '../hooks/useMaintenance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wrench, Clock, CheckCircle, AlertTriangle, Settings, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const MaintenanceDashboardPage = () => {
  const { data: summary, isLoading: isSummaryLoading } = useMaintenanceDashboardSummary();
  const { data: analytics, isLoading: isAnalyticsLoading } = useMaintenanceDashboardAnalytics();

  if (isSummaryLoading || isAnalyticsLoading) {
    return <div className="p-8 text-center text-gray-500">Loading maintenance dashboard...</div>;
  }

  const kpis = [
    { title: 'Total Jobs', value: summary?.total || 0, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Repair', value: summary?.active || 0, icon: Settings, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Overdue', value: summary?.overdue || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Completed', value: summary?.completed || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Avg Repair (hrs)', value: summary?.avgRepairTimeHours || 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Cost ($)', value: summary?.totalCost?.toLocaleString() || 0, icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Maintenance Dashboard</h1>
          <p className="text-gray-500 mt-1">Track vehicle health, downtime, and repair costs.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Cost Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {analytics?.costTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.costTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No cost data available</div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {analytics?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No type distribution data available</div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default MaintenanceDashboardPage;
