import React from 'react';

// TODO: implement by Deepika
const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h2>
        <span className="text-sm text-slate-400 font-medium">Real-time Operations Metrics</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-200">Operational Stats</h3>
        <p className="mt-2 text-slate-400">
          This dashboard panel will contain high-level metric cards, active trip tracking, driver availability graphs, and recent maintenance schedules.
        </p>
        <div className="mt-6 border-t border-slate-800 pt-6">
          <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-xs font-semibold text-amber-400">
            TODO: implement by Deepika
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
