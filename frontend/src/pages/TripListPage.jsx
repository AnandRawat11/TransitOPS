import React from 'react';

// TODO: implement by Nitin Singh
const TripListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Trip Dispatch</h2>
        <span className="text-sm text-slate-400 font-medium">Active & Historical Trips</span>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-slate-200">Trip Dispatches List</h3>
        <p className="mt-2 text-slate-400">
          This page will show dispatched trips, vehicle & driver assignments, planned routes, source/destination data, cargo weights, and dispatch statuses.
        </p>
        <div className="mt-6 border-t border-slate-800 pt-6">
          <span className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-xs font-semibold text-amber-400">
            TODO: implement by Nitin Singh
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripListPage;
