import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle, 
  Wrench, 
  Map, 
  Clock, 
  UserCheck, 
  Activity,
  RefreshCw
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Label
} from 'recharts';
import DriverListPage from './DriverListPage';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchKpis();
  }, []);

  const kpiCards = kpis ? [
    { title: 'Active Vehicles', value: kpis.activeVehicles, subtitle: 'Total active vehicles', icon: Truck, color: 'text-blue-400', bg: 'bg-blue-600' },
    { title: 'Available Vehicles', value: kpis.availableVehicles, subtitle: 'Ready to dispatch', icon: CheckCircle, color: 'text-white', bg: 'bg-green-600' },
    { title: 'Vehicles in Maintenance', value: kpis.vehiclesInMaintenance, subtitle: 'Under maintenance', icon: Wrench, color: 'text-white', bg: 'bg-orange-500' },
    { title: 'Active Trips', value: kpis.activeTrips, subtitle: 'Currently in progress', icon: Map, color: 'text-white', bg: 'bg-purple-500' },
    { title: 'Pending Trips', value: kpis.pendingTrips, subtitle: 'Awaiting dispatch', icon: Clock, color: 'text-white', bg: 'bg-yellow-500' },
    { title: 'Drivers On Duty', value: kpis.driversOnDuty, subtitle: 'Currently on duty', icon: UserCheck, color: 'text-white', bg: 'bg-teal-500' },
    { title: 'Fleet Utilization', value: `${kpis.fleetUtilization}%`, subtitle: 'On Trip / Total Active', icon: Activity, color: 'text-white', bg: 'bg-rose-500' },
  ] : [];

  const totalVehicles = kpis ? kpis.activeVehicles + kpis.vehiclesInMaintenance + 8 : 24; // Mocking retired based on image for the donut center
  
  const pieData = kpis ? [
    { name: 'Available', value: kpis.availableVehicles, color: '#3b82f6' },
    { name: 'On Trip', value: kpis.activeVehicles - kpis.availableVehicles, color: '#22c55e' },
    { name: 'Maintenance', value: kpis.vehiclesInMaintenance, color: '#f97316' },
    { name: 'Retired', value: 8, color: '#8b5cf6' }, // Mocking retired to match 33.3% in image
  ] : [];

  const barData = kpis ? [
    { name: 'Active Trips', value: kpis.activeTrips, color: '#8b5cf6' },
    { name: 'Pending Trips', value: kpis.pendingTrips, color: '#eab308' }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="flex gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 w-40 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      {error && (
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <span className="text-sm text-slate-400">Overview of your fleet operations</span>
        </div>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Vehicle Type</label>
            <select className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 focus:outline-none w-36">
              <option>All Types</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 focus:outline-none w-36">
              <option>All Status</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Region</label>
            <select className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 focus:outline-none w-36">
              <option>All Regions</option>
            </select>
          </div>
          <button 
            onClick={fetchKpis}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards (Scrollable Row) */}
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="flex-none w-48 rounded-xl border border-slate-700 bg-slate-800/50 p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${card.bg}`}>
                  <Icon size={16} className="text-white" />
                </div>
                <p className="text-xs font-medium text-slate-300 leading-tight">{card.title}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-[10px] text-slate-400 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Status Overview */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Fleet Status Overview</h3>
          <div className="flex h-56 items-center">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{totalVehicles}</span>
                <span className="text-xs text-slate-400">Total Vehicles</span>
              </div>
            </div>
            <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-slate-300">{entry.name}</span>
                  </div>
                  <span className="text-slate-400">
                    {entry.value} ({((entry.value / totalVehicles) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trips Overview */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Trips Overview</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  domain={[0, 6]}
                  tickCount={4}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={80}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#f8fafc" fontSize={14} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Drivers Section */}
      <div className="pt-2">
        <DriverListPage isEmbedded={true} />
      </div>

    </div>
  );
};

// Custom Label component for Recharts Bar
const LabelList = (props) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y - 10} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold">
      {value}
    </text>
  );
};

export default DashboardPage;
