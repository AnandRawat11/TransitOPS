import React from 'react';

const StatusBadge = ({ status }) => {
  const statusMap = {
    // Vehicles
    'Available': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    'On Trip': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/25' },
    'In Shop': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' },
    'Retired': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/25' },
    
    // Trips
    'Draft': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/25' },
    'Dispatched': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/25' },
    'Completed': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    'Cancelled': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25' },
    
    // Drivers
    'Off Duty': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/25' },
    'Suspended': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25' },
  };

  const style = statusMap[status] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/25',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-all ${style.bg} ${style.text} ${style.border}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
