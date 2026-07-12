import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as fuelApi from '../api/fuelApi';
import * as expenseApi from '../api/expenseApi';
import * as vehicleApi from '../api/vehicleApi';
import {
  Fuel,
  DollarSign,
  Plus,
  Trash2,
  Filter,
  Calendar,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';

const FuelExpensePage = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'FleetManager';
  const isDriverOrManager = user?.role === 'Driver' || user?.role === 'FleetManager';
  const isAnalystOrManager = user?.role === 'FinancialAnalyst' || user?.role === 'FleetManager';

  // Active Tab: 'fuel' or 'expense'
  const [activeTab, setActiveTab] = useState('fuel');
  
  // Data States
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedExpenseType, setSelectedExpenseType] = useState('');

  // Modals / Create Form States
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Fuel Form Fields
  const [fuelForm, setFuelForm] = useState({
    vehicle: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Expense Form Fields
  const [expenseForm, setExpenseForm] = useState({
    vehicle: '',
    type: 'Toll',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehiclesData, fuelData, expensesData] = await Promise.all([
        vehicleApi.getVehicles(),
        fuelApi.getFuelLogs(),
        expenseApi.getExpenses()
      ]);

      setVehicles(Array.isArray(vehiclesData.data) ? vehiclesData.data : (Array.isArray(vehiclesData) ? vehiclesData : []));
      setFuelLogs(Array.isArray(fuelData.data) ? fuelData.data : (Array.isArray(fuelData) ? fuelData : []));
      setExpenses(Array.isArray(expensesData.data) ? expensesData.data : (Array.isArray(expensesData) ? expensesData : []));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter handlers
  const handleFilterReset = () => {
    setSelectedVehicle('');
    setSelectedExpenseType('');
  };

  // Add Fuel Log
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    if (!fuelForm.vehicle || !fuelForm.liters || !fuelForm.cost || !fuelForm.date) {
      alert('Please fill out all fields');
      return;
    }
    try {
      await fuelApi.createFuelLog({
        vehicle: fuelForm.vehicle,
        liters: parseFloat(fuelForm.liters),
        cost: parseFloat(fuelForm.cost),
        date: fuelForm.date,
      });
      setShowFuelModal(false);
      setFuelForm({
        vehicle: '',
        liters: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to log fuel purchase.');
    }
  };

  // Add Expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.vehicle || !expenseForm.type || !expenseForm.amount || !expenseForm.date) {
      alert('Please fill out all fields');
      return;
    }
    try {
      await expenseApi.createExpense({
        vehicle: expenseForm.vehicle,
        type: expenseForm.type,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        notes: expenseForm.notes,
      });
      setShowExpenseModal(false);
      setExpenseForm({
        vehicle: '',
        type: 'Toll',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to log expense.');
    }
  };

  // Delete Fuel Log
  const handleDeleteFuel = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fuel entry?')) return;
    try {
      await fuelApi.deleteFuelLog(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete fuel entry.');
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense entry?')) return;
    try {
      await expenseApi.deleteExpense(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete expense entry.');
    }
  };

  // Calculate Stat Summaries
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const safeFuelLogs = Array.isArray(fuelLogs) ? fuelLogs : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const filteredFuelLogs = safeFuelLogs.filter(log => {
    if (selectedVehicle && log.vehicle?._id !== selectedVehicle) return false;
    return true;
  });

  const filteredExpenses = safeExpenses.filter(exp => {
    if (selectedVehicle && exp.vehicle?._id !== selectedVehicle) return false;
    if (selectedExpenseType && exp.type !== selectedExpenseType) return false;
    return true;
  });

  const totalFuelLiters = filteredFuelLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
  const totalFuelCost = filteredFuelLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const totalExpensesCost = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Fuel & Expenses</h2>
          <p className="text-slate-400 mt-1">Monitor vehicle refuel transactions and operational overhead costs</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'fuel' && isDriverOrManager && (
            <button
              onClick={() => setShowFuelModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" /> Log Fuel
            </button>
          )}
          {activeTab === 'expense' && isAnalystOrManager && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total fuel liters */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <Fuel className="w-36 h-36 text-white" />
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500 border border-blue-500/20">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Fuel Logged</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {totalFuelLiters.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
              </h3>
            </div>
          </div>
        </div>

        {/* Total fuel cost */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <DollarSign className="w-36 h-36 text-white" />
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500 border border-blue-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Fuel Expenditure</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Total general expenses */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
            <Layers className="w-36 h-36 text-white" />
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500 border border-emerald-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total General Expenses</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${totalExpensesCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-950/80 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => { setActiveTab('fuel'); handleFilterReset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'fuel'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-4 h-4" /> Fuel Logs
          </button>
          <button
            onClick={() => { setActiveTab('expense'); handleFilterReset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'expense'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Expenses
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-400">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer border-none"
            >
              <option value="" className="bg-slate-900">All Vehicles</option>
              {safeVehicles.map((v) => (
                <option key={v._id} value={v._id} className="bg-slate-900">
                  {v.registrationNumber} - {v.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'expense' && (
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-400">
              <Layers className="w-4 h-4 text-slate-500" />
              <select
                value={selectedExpenseType}
                onChange={(e) => setSelectedExpenseType(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none cursor-pointer border-none"
              >
                <option value="" className="bg-slate-900">All Types</option>
                <option value="Toll" className="bg-slate-900">Toll</option>
                <option value="Permit" className="bg-slate-900">Permit</option>
                <option value="Misc" className="bg-slate-900">Misc</option>
              </select>
            </div>
          )}

          {(selectedVehicle || selectedExpenseType) && (
            <button
              onClick={handleFilterReset}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main content table area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 mt-4 text-sm font-medium">Loading records...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h4 className="text-white font-semibold mt-4">Error Fetching Logs</h4>
          <p className="text-slate-400 text-sm mt-2">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'fuel' ? (
            /* Fuel Logs Table */
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
              {filteredFuelLogs.length === 0 ? (
                <div className="py-16 text-center">
                  <Fuel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">No fuel purchase logs match your filter criteria.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Vehicle</th>
                      <th className="py-4 px-6">Refuel Date</th>
                      <th className="py-4 px-6 text-right">Liters</th>
                      <th className="py-4 px-6 text-right">Price per Liter</th>
                      <th className="py-4 px-6 text-right">Total Cost</th>
                      <th className="py-4 px-6">Associated Trip</th>
                      {isManager && <th className="py-4 px-6 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                    {filteredFuelLogs.map((log) => {
                      const pricePerLiter = log.liters > 0 ? (log.cost / log.liters).toFixed(2) : '0.00';
                      return (
                        <tr key={log._id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6 font-medium text-white">
                            {log.vehicle?.registrationNumber || 'Unknown'}
                            <span className="block text-xs font-normal text-slate-400">{log.vehicle?.name}</span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(log.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-medium text-slate-200">
                            {log.liters?.toFixed(1)} L
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-slate-400">
                            ${pricePerLiter}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-white">
                            ${log.cost?.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            {log.trip ? (
                              <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs">
                                <FileText className="w-3.5 h-3.5" />
                                {log.trip.source} ➔ {log.trip.destination}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">None</span>
                            )}
                          </td>
                          {isManager && (
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleDeleteFuel(log._id)}
                                className="text-slate-500 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded transition-colors"
                                title="Delete Log Entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* Expenses Table */
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20">
              {filteredExpenses.length === 0 ? (
                <div className="py-16 text-center">
                  <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">No expenses match your filter criteria.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Vehicle</th>
                      <th className="py-4 px-6">Expense Date</th>
                      <th className="py-4 px-6">Expense Category</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                      <th className="py-4 px-6">Notes / Description</th>
                      {isManager && <th className="py-4 px-6 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6 font-medium text-white">
                          {exp.vehicle?.registrationNumber || 'Unknown'}
                          <span className="block text-xs font-normal text-slate-400">{exp.vehicle?.name}</span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {new Date(exp.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${
                            exp.type === 'Toll'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : exp.type === 'Permit'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                          }`}>
                            {exp.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-white">
                          ${exp.amount?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate text-slate-400" title={exp.notes}>
                          {exp.notes || <span className="italic text-slate-600">No notes</span>}
                        </td>
                        {isManager && (
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              className="text-slate-500 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded transition-colors"
                              title="Delete Expense Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Fuel Log Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Fuel className="w-5 h-5 text-blue-500" /> Log Refuel Event
              </h3>
              <button
                onClick={() => setShowFuelModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFuelSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Select Vehicle</label>
                <select
                  required
                  value={fuelForm.vehicle}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select --</option>
                  {safeVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Fuel (Liters)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 85.5"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 125.00"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Refuel Date</label>
                <input
                  type="date"
                  required
                  value={fuelForm.date}
                  onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" /> Log Operational Expense
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Select Vehicle</label>
                <select
                  required
                  value={expenseForm.vehicle}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select --</option>
                  {safeVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} ({v.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Toll">Toll</option>
                    <option value="Permit">Permit</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 50.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Expense Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Notes / Details</label>
                <textarea
                  rows="3"
                  placeholder="Describe what the expense was for..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelExpensePage;
