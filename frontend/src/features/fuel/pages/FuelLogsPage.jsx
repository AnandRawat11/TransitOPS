import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useFuelLogs } from '../hooks/useFuel';

const FuelLogsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useFuelLogs({ page, limit: 10, search });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fuel Logs</h1>
          <p className="text-slate-600 dark:text-slate-400">Track fleet refueling and mileage</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Log Fuel</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search fuel logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 dark:text-white transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Filter size={20} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Log #</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Cost</th>
                <th className="p-4 font-medium">Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full mb-2"></div>
                    <p>Loading fuel logs...</p>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No fuel logs found.
                  </td>
                </tr>
              ) : (
                data?.data?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{log.fuelLogNumber}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 dark:text-white">{log.vehicleId?.registrationNumber}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{log.vehicleId?.vehicleName}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {new Date(log.filledAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {log.quantity} {log.fuelType}
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      ${log.totalCost.toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {log.driverId?.name}
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

export default FuelLogsPage;
