import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No Data Found", 
  message = "There's nothing here yet.", 
  action, 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-xl border border-slate-200 border-dashed ${className}`}>
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
