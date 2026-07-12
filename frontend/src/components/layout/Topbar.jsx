import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-8 backdrop-blur-md">
      {/* Title / Section Name */}
      <div>
        <h1 className="text-lg font-semibold text-white">Operations Control</h1>
      </div>

      {/* Action / User Panel */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-slate-900"></span>
        </button>

        {/* User Card */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
            <span className="text-xs text-brand-400 font-medium">{user?.role}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-brand-400">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
