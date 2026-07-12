import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Menu, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 lg:px-8 backdrop-blur-md">
      {/* Title / Section Name */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-white">Operations Control</h1>
      </div>

      {/* Action / User Panel */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-slate-900"></span>
        </button>

        {/* User Card & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 border-l border-slate-800 pl-6 focus:outline-none group text-left"
          >
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{user?.name}</span>
              <span className="text-xs text-brand-400 font-medium group-hover:text-brand-300 transition-colors">{user?.role}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm group-hover:bg-blue-500 transition-all">
              {getInitials(user?.name)}
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-xl ring-1 ring-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              <Link 
                to="/settings" 
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all border-none bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
