import React from 'react';

// TODO: implement by Saurav Shandilya
const FuelExpensePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Fuel & Expenses</h2>
        <span className="text-sm text-slate-400 font-medium">Cost Logs</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-200">Fuel & Operational Expenses</h3>
        <p className="mt-2 text-slate-400">
          This page will show fuel efficiency metrics, fuel purchase logs, route toll expenses, and miscellaneous transport costs.
        </p>
        <div className="mt-6 border-t border-slate-800 pt-6">
          <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-xs font-semibold text-amber-400">
            TODO: implement by Saurav Shandilya
          </span>
        </div>
      </div>
    </div>
  );
};

export default FuelExpensePage;
