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
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  
  // Manager dashboard states
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Driver dashboard states
  const [driverProfile, setDriverProfile] = useState(null);
  const [driverTrips, setDriverTrips] = useState([]);
  const [fetchingDriver, setFetchingDriver] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Modal state for completing trip
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [actualDistance, setActualDistance] = useState('');
  const [actualFuel, setActualFuel] = useState('');

  // Fetch manager KPI stats
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

  // Fetch driver-specific profile and trips
  const fetchDriverData = async () => {
    try {
      setFetchingDriver(true);
      const token = localStorage.getItem('token');
      
      // Fetch all drivers to find our profile
      const resDrivers = await fetch('/api/drivers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataDrivers = await resDrivers.json();
      let profile = null;
      if (dataDrivers.success && Array.isArray(dataDrivers.data)) {
        profile = dataDrivers.data.find(d => d?.email?.toLowerCase() === user?.email?.toLowerCase());
        setDriverProfile(profile || null);
      }

      // Fetch all trips to filter the ones assigned to this driver
      const resTrips = await fetch('/api/trips', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataTrips = await resTrips.json();
      if (dataTrips.success && dataTrips.data) {
        const rawTrips = Array.isArray(dataTrips.data) ? dataTrips.data : (Array.isArray(dataTrips.data?.data) ? dataTrips.data.data : []);
        const profileId = profile?._id || profile?.id;
        const myTrips = rawTrips.filter(t => {
          const dId = t.driverId?._id || t.driverId?.id || t.driverId;
          const pId = profileId || user?.id;
          return dId && pId && dId.toString() === pId.toString();
        });
        console.log('[DriverDashboardDebug] User:', user);
        console.log('[DriverDashboardDebug] Profile:', profile);
        console.log('[DriverDashboardDebug] ProfileId:', profileId, 'User ID:', user?.id);
        console.log('[DriverDashboardDebug] Raw Trips:', rawTrips);
        console.log('[DriverDashboardDebug] Filtered Trips:', myTrips);
        setDriverTrips(myTrips);

        // Select the active/pending trip or default to the first trip
        const defaultTrip = myTrips.find(t => t.tripStatus === 'IN_PROGRESS') ||
                            myTrips.find(t => t.tripStatus === 'ASSIGNED') ||
                            myTrips[0] ||
                            null;
        setSelectedTrip(prev => {
          if (prev) {
            return myTrips.find(t => t.id === prev.id) || defaultTrip;
          }
          return defaultTrip;
        });
      }
    } catch (err) {
      console.error('Error loading driver data:', err);
    } finally {
      setFetchingDriver(false);
    }
  };

  // Driver status action: Start Trip
  const handleStartTrip = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'IN_PROGRESS', notes: 'Driver started the trip' })
      });
      const data = await response.json();
      if (data.success) {
        fetchDriverData();
      } else {
        alert(data.message || 'Failed to start trip');
      }
    } catch (err) {
      alert('Error starting trip');
    }
  };

  // Driver status action: Complete Trip
  const handleCompleteTripSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trips/${selectedTripId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          actualDistance: Number(actualDistance),
          actualFuel: Number(actualFuel),
          fuelConsumed: Number(actualFuel)
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchDriverData();
        setIsCompletionModalOpen(false);
        setSelectedTripId(null);
        setActualDistance('');
        setActualFuel('');
      } else {
        alert(data.message || 'Failed to complete trip');
      }
    } catch (err) {
      alert('Error completing trip');
    }
  };

  useEffect(() => {
    if (user?.role === 'Driver') {
      fetchDriverData();
    } else {
      fetchKpis();
    }
  }, [user]);

  // Manager dashboard KPI Cards & helper data
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
    { name: 'Retired', value: 8, color: '#8b5cf6' },
  ] : [];

  const barData = kpis ? [
    { name: 'Active Trips', value: kpis.activeTrips, color: '#8b5cf6' },
    { name: 'Pending Trips', value: kpis.pendingTrips, color: '#eab308' }
  ] : [];

  // Loading States
  if (user?.role === 'Driver' ? fetchingDriver : loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 w-48 bg-slate-800 rounded-xl flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDER DRIVER DASHBOARD ---
  if (user?.role === 'Driver') {
    const driverActiveTrips = driverTrips.filter(t => t.tripStatus === 'IN_PROGRESS');
    const driverPendingTrips = driverTrips.filter(t => t.tripStatus === 'ASSIGNED');
    const driverCompletedTrips = driverTrips.filter(t => t.tripStatus === 'COMPLETED');
    const driverCancelledTrips = driverTrips.filter(t => t.tripStatus === 'CANCELLED');
    
    const driverDistance = driverTrips.reduce((acc, t) => acc + (t.actualDistance || t.plannedDistance || 0), 0);
    
    const driverKpiCards = [
      { title: 'Safety Score', value: `${driverProfile?.safetyScore || 100} / 100`, subtitle: 'Compliance Rating', icon: Activity, bg: 'bg-emerald-600' },
      { title: 'Assigned Vehicle', value: driverProfile?.assignedVehicle?.registrationNumber || 'None', subtitle: driverProfile?.assignedVehicle?.name || 'No Vehicle Assigned', icon: Truck, bg: 'bg-blue-600' },
      { title: 'Active Trips', value: driverActiveTrips.length, subtitle: 'Currently on road', icon: Map, bg: 'bg-indigo-600' },
      { title: 'Pending Trips', value: driverPendingTrips.length, subtitle: 'Awaiting dispatch', icon: Clock, bg: 'bg-amber-500' },
      { title: 'Completed Trips', value: driverCompletedTrips.length, subtitle: 'Delivered successfully', icon: CheckCircle, bg: 'bg-teal-500' },
      { title: 'Total Distance', value: `${driverDistance} km`, subtitle: 'Distance traveled', icon: Activity, bg: 'bg-orange-500' },
      { title: 'License Category', value: driverProfile?.licenseCategory || 'N/A', subtitle: 'Class category', icon: UserCheck, bg: 'bg-purple-600' },
    ];

    const totalDriverTripsVal = driverTrips.length;
    const driverPieData = [
      { name: 'Completed', value: driverCompletedTrips.length, color: '#10b981' },
      { name: 'In Progress', value: driverActiveTrips.length, color: '#3b82f6' },
      { name: 'Assigned', value: driverPendingTrips.length, color: '#f59e0b' },
      { name: 'Cancelled', value: driverCancelledTrips.length, color: '#64748b' }
    ];

    const displayPieData = totalDriverTripsVal > 0 ? driverPieData : [
      { name: 'No Trips', value: 1, color: '#334155' }
    ];

    const driverBarData = driverTrips.slice(0, 5).map(t => ({
      name: t.tripNumber,
      value: t.actualDistance || t.plannedDistance || 0,
      color: t.tripStatus === 'COMPLETED' ? '#10b981' : (t.tripStatus === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b')
    }));

    const displayBarData = driverBarData.length > 0 ? driverBarData : [
      { name: 'No Data', value: 0, color: '#334155' }
    ];

    return (
      <div className="space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Driver Console</h2>
            <span className="text-sm text-slate-400">Overview of your assignments and metrics</span>
          </div>
          <button 
            onClick={fetchDriverData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap self-start lg:self-auto"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* KPI Cards (Scrollable Row) */}
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {driverKpiCards.map((card, index) => {
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
                  <p className="text-xl font-bold text-white truncate">{card.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Status Breakdown */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-4">Trip Status Breakdown</h3>
            <div className="flex h-56 items-center">
              <div className="w-1/2 h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{totalDriverTripsVal}</span>
                  <span className="text-xs text-slate-400">Total Trips</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col gap-3 justify-center">
                {totalDriverTripsVal > 0 ? (
                  driverPieData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-300">{entry.name}</span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        {entry.value} ({((entry.value / (totalDriverTripsVal || 1)) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">No trips recorded yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Operational Metrics (Distance Logged) */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-4">Trip Distance History (km)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayBarData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                    {displayBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                    {driverBarData.length > 0 && (
                      <LabelList dataKey="value" position="top" fill="#f8fafc" fontSize={12} fontWeight="bold" />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section: Trips List & Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Trips Table (2/3 width) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Your Recent Trips</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-700 text-[10px] uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Trip #</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Start Time</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {driverTrips.map(trip => (
                    <tr 
                      key={trip.id} 
                      onClick={() => setSelectedTrip(trip)}
                      className={`hover:bg-slate-700/30 text-slate-300 cursor-pointer transition-colors ${selectedTrip?.id === trip.id ? 'bg-blue-950/30 text-white font-medium border-l-2 border-blue-500' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-white">{trip.tripNumber}</td>
                      <td className="py-3 px-4">{trip.startLocation} → {trip.destination}</td>
                      <td className="py-3 px-4">{trip.plannedStartTime ? new Date(trip.plannedStartTime).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4">{trip.actualDistance || trip.plannedDistance || 0} km</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          trip.tripStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          trip.tripStatus === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          trip.tripStatus === 'ASSIGNED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {trip.tripStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {driverTrips.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">No trips logged under your account.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details & Actions Panel (1/3 width) */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Trip Details</h3>
              {selectedTrip ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white">{selectedTrip.tripNumber}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selectedTrip.tripStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedTrip.tripStatus === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      selectedTrip.tripStatus === 'ASSIGNED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {selectedTrip.tripStatus}
                    </span>
                  </div>

                  <div className="border-t border-slate-700/50 my-2"></div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Route</span>
                      <span className="text-slate-200 font-semibold text-sm">{selectedTrip.startLocation} → {selectedTrip.destination}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Cargo Type</span>
                        <span className="text-slate-200 font-medium">{selectedTrip.cargoType || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Cargo Weight</span>
                        <span className="text-slate-200 font-medium">{selectedTrip.cargoWeight ? `${selectedTrip.cargoWeight} kg` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Distance</span>
                        <span className="text-slate-200 font-medium">{selectedTrip.actualDistance || selectedTrip.plannedDistance || 0} km</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Duration</span>
                        <span className="text-slate-200 font-medium">
                          {selectedTrip.plannedStartTime && selectedTrip.plannedEndTime 
                            ? `${Math.round((new Date(selectedTrip.plannedEndTime) - new Date(selectedTrip.plannedStartTime)) / (1000 * 60 * 60))} hrs` 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Dispatcher Notes</span>
                      <p className="text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/50 italic leading-relaxed text-[11px]">
                        {selectedTrip.notes || 'No dispatcher notes recorded.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <CheckCircle size={36} className="text-slate-600 mb-2" />
                  <p className="text-[11px]">Select a trip to view dispatch details and available actions.</p>
                </div>
              )}
            </div>

            {selectedTrip && (
              <div className="mt-6 pt-4 border-t border-slate-700/50">
                {selectedTrip.tripStatus === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStartTrip(selectedTrip.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-lg shadow-blue-900/20"
                  >
                    Start Dispatch
                  </button>
                )}
                {selectedTrip.tripStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={() => {
                      setSelectedTripId(selectedTrip.id);
                      setActualDistance(selectedTrip.plannedDistance || '');
                      setIsCompletionModalOpen(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-lg shadow-emerald-900/20"
                  >
                    Complete Dispatch
                  </button>
                )}
                {selectedTrip.tripStatus === 'COMPLETED' && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg py-2 text-center text-[10px] font-semibold">
                    ✓ Trip completed and logged
                  </div>
                )}
                {selectedTrip.tripStatus === 'CANCELLED' && (
                  <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-lg py-2 text-center text-[10px] font-semibold">
                    🚫 Trip was cancelled
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion Modal */}
        {isCompletionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
              <h3 className="text-base font-bold text-white mb-1">Complete Dispatch</h3>
              <p className="text-xs text-slate-400 mb-5">Please submit the final trip statistics below.</p>
              
              <form onSubmit={handleCompleteTripSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Actual Distance Traveled (km)</label>
                  <input
                    type="number"
                    required
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition"
                    placeholder="e.g. 350"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Actual Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    required
                    value={actualFuel}
                    onChange={(e) => setActualFuel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm transition"
                    placeholder="e.g. 45"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompletionModalOpen(false);
                      setSelectedTripId(null);
                    }}
                    className="px-3.5 py-2 rounded-lg font-medium text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  >
                    Complete Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER MANAGER/ADMIN DASHBOARD ---
  return (
    <div className="space-y-6 text-slate-200">
      {error && (
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Operations Control</h2>
          <span className="text-sm text-slate-400">Overview of your fleet operations</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm transition whitespace-nowrap"
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
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 min-w-0">
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
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 min-w-0">
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
