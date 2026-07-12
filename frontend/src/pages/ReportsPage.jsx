import React, { useState, useEffect } from 'react';
import * as reportApi from '../api/reportApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Download,
  AlertCircle,
  Activity,
  Layers,
  Fuel,
  Percent,
  RefreshCw
} from 'lucide-react';

const ReportsPage = () => {
  const [operationalCosts, setOperationalCosts] = useState([]);
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [utilization, setUtilization] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [vehicleFilter, setVehicleFilter] = useState('');

  const fetchReportsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [opCosts, fuelEff, fleetUtil, roi] = await Promise.all([
        reportApi.getOperationalCost(),
        reportApi.getFuelEfficiency(),
        reportApi.getFleetUtilization(),
        reportApi.getVehicleROI()
      ]);

      setOperationalCosts(opCosts.data || opCosts);
      setFuelEfficiency(fuelEff.data || fuelEff);
      setUtilization(fleetUtil.data || fleetUtil);
      setRoiData(roi.data || roi);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to compile reports. Ensure the backend database is connected and seeded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await reportApi.downloadCSVReport();
    } catch (err) {
      console.error('CSV Export failed:', err);
      alert('Failed to download CSV report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Local filtering of aggregated data
  const safeOpCosts = Array.isArray(operationalCosts) ? operationalCosts : [];
  const safeFuelEff = Array.isArray(fuelEfficiency) ? fuelEfficiency : [];
  const safeRoi = Array.isArray(roiData) ? roiData : [];

  const filteredOpCosts = safeOpCosts.filter(
    (item) => !vehicleFilter || item.vehicleId === vehicleFilter
  );

  const filteredFuelEff = safeFuelEff.filter(
    (item) => !vehicleFilter || item.vehicleId === vehicleFilter
  );

  const filteredRoi = safeRoi.filter(
    (item) => !vehicleFilter || item.vehicleId === vehicleFilter
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Reports & Analytics</h2>
          <p className="text-slate-400 mt-1">Cross-module operational insights, fleet efficiency, and ROI analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReportsData}
            disabled={loading}
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Utilization and General Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Utilization card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden md:col-span-2">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <Activity className="w-36 h-36 text-white" />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Fleet Utilization</span>
              <h3 className="text-4xl font-extrabold text-white">
                {utilization ? `${utilization.utilizationRate}%` : '0%'}
              </h3>
              <p className="text-xs text-slate-500">
                {utilization ? `${utilization.activeVehicles} on active trips / ${utilization.totalVehicles} total vehicles` : 'No vehicle logs found'}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500 border border-blue-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full mt-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${utilization ? utilization.utilizationRate : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Total Cost card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Total Fleet Cost</span>
              <h3 className="text-3xl font-extrabold text-white">
                ${safeOpCosts.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-xs text-slate-500">Sum of fuel and maintenance logs</p>
            </div>
            <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-500 border border-indigo-500/20">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Avg Fuel efficiency card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">Avg Efficiency</span>
              <h3 className="text-3xl font-extrabold text-white">
                {(safeFuelEff.reduce((sum, item) => sum + item.efficiency, 0) / (safeFuelEff.length || 1)).toFixed(1)} km/L
              </h3>
              <p className="text-xs text-slate-500">Average of all vehicle yields</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500 border border-emerald-500/20">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle filter dropdown */}
      <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-lg px-4 py-2 w-fit">
        <span className="text-sm font-semibold text-slate-400">Filter View:</span>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer border-none"
        >
          <option value="" className="bg-slate-900 text-slate-300">All Vehicles</option>
          {safeOpCosts.map((v) => (
            <option key={v.vehicleId} value={v.vehicleId} className="bg-slate-900 text-slate-200">
              {v.registrationNumber} - {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Charts Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 mt-4 text-sm font-medium">Aggregating real-time charts...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h4 className="text-white font-semibold mt-4">Database Error</h4>
          <p className="text-slate-400 text-sm mt-2">{error}</p>
          <button
            onClick={fetchReportsData}
            className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Stacked Operational Cost */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Operational Cost Analysis</h3>
              <p className="text-xs text-slate-400">Total expenditure by vehicle ($ Fuel vs. $ Maintenance)</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredOpCosts}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="registrationNumber" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelClassName="text-slate-200 font-bold"
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="fuelCost" name="Fuel Cost" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="maintenanceCost" name="Maintenance" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Fuel Efficiency Bar Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Fuel Yield & Efficiency</h3>
              <p className="text-xs text-slate-400">Average actual distance covered per liter of fuel (km/L)</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredFuelEff}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="registrationNumber" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelClassName="text-slate-200 font-bold"
                    formatter={(value) => [`${value} km/L`, 'Efficiency']}
                  />
                  <Bar dataKey="efficiency" name="Efficiency" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {filteredFuelEff.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.efficiency > 3.0 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table: Vehicle ROI */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 lg:col-span-2">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white">Vehicle ROI & Net Profitability</h3>
                <p className="text-xs text-slate-400">Financial yield analysis: (Revenue - (Fuel + Maintenance)) / Acquisition Cost</p>
              </div>
              <span className="text-xs text-slate-500 italic">
                * Flat rate revenue model ($2.50/km) applied to completed trip logs
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Vehicle</th>
                    <th className="py-3.5 px-6 text-right">Acquisition Cost</th>
                    <th className="py-3.5 px-6 text-right">Revenue</th>
                    <th className="py-3.5 px-6 text-right">Fuel Cost</th>
                    <th className="py-3.5 px-6 text-right">Maintenance Cost</th>
                    <th className="py-3.5 px-6 text-right">Net Profit</th>
                    <th className="py-3.5 px-6 text-center">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                  {filteredRoi.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No vehicle details available.
                      </td>
                    </tr>
                  ) : (
                    filteredRoi.map((item) => {
                      const hasRoi = item.roi !== 'N/A';
                      const isPositive = hasRoi && item.roi > 0;
                      const isZero = hasRoi && item.roi === 0;

                      return (
                        <tr key={item.vehicleId} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6 font-semibold text-white">
                            {item.registrationNumber}
                            <span className="block text-xs font-normal text-slate-400">{item.name}</span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-slate-300">
                            ${item.acquisitionCost?.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-emerald-400">
                            +${item.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-rose-400">
                            -${item.fuelCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-indigo-400">
                            -${item.maintenanceCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`py-4 px-6 text-right font-mono font-bold ${
                            item.netProfit > 0 ? 'text-emerald-400' : item.netProfit < 0 ? 'text-rose-400' : 'text-slate-300'
                          }`}>
                            {item.netProfit >= 0 ? '+' : '-'}${Math.abs(item.netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              !hasRoi
                                ? 'bg-slate-800 text-slate-400'
                                : isPositive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isZero
                                ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {!hasRoi ? 'N/A' : `${item.roi > 0 ? '+' : ''}${item.roi}%`}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
