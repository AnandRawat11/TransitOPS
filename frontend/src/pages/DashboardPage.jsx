import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle, 
  Wrench, 
  Map, 
  Clock, 
  UserCheck, 
  Activity 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/kpis', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setKpis(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  const kpiCards = kpis ? [
    { title: 'Active Vehicles', value: kpis.activeVehicles, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Available Vehicles', value: kpis.availableVehicles, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'In Maintenance', value: kpis.vehiclesInMaintenance, icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Active Trips', value: kpis.activeTrips, icon: Map, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Pending Trips', value: kpis.pendingTrips, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { title: 'Drivers On Duty', value: kpis.driversOnDuty, icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { title: 'Fleet Utilization', value: `${kpis.fleetUtilization}%`, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ] : [];

  const chartData = kpis ? [
    { name: 'Available', value: kpis.availableVehicles, color: '#4ade80' },
    { name: 'On Trip', value: kpis.activeVehicles - kpis.availableVehicles - kpis.vehiclesInMaintenance, color: '#3b82f6' }, // Approximate calculation from active
    { name: 'Maintenance', value: kpis.vehiclesInMaintenance, color: '#facc15' },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h2>
        <span className="text-sm text-slate-400 font-medium">Real-time Operations Metrics</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm flex items-center justify-between hover:bg-slate-800/50 transition">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
                <p className="text-3xl font-bold text-slate-200 mt-2">{card.value}</p>
              </div>
              <div className={`p-4 rounded-full ${card.bg}`}>
                <Icon size={28} className={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Fleet Status Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
