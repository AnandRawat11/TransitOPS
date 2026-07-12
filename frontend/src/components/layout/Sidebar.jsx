import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Sparkles,
  PieChart,
  Users,
  Activity,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role;

  // Navigation config with role-based access control
  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['FleetManager', 'Driver', 'SafetyOfficer', 'FinancialAnalyst'],
    },
    {
      path: '/vehicles',
      label: 'Vehicles',
      icon: Truck,
      allowedRoles: ['FleetManager', 'SafetyOfficer'],
    },
    {
      path: '/drivers',
      label: 'Drivers',
      icon: Users,
      allowedRoles: ['FleetManager', 'SafetyOfficer'],
    },
    {
      path: '/trips',
      label: 'Trips',
      icon: MapPin,
      allowedRoles: ['FleetManager', 'Driver'],
    },
    {
      path: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      allowedRoles: ['FleetManager', 'SafetyOfficer'],
    },
    {
      path: '/fuel-expenses',
      label: 'Fuel & Expenses',
      icon: Fuel,
      allowedRoles: ['FleetManager', 'Driver', 'FinancialAnalyst'],
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: BarChart3,
      allowedRoles: ['FleetManager', 'FinancialAnalyst'],
    },
    {
      path: '/ai',
      label: 'AI Intelligence',
      icon: Sparkles,
      allowedRoles: ['FleetManager', 'FinancialAnalyst', 'Admin'],
    },
    {
      path: '/analytics',
      label: 'BI Dashboard',
      icon: PieChart,
      allowedRoles: ['FleetManager', 'FinancialAnalyst', 'Admin'],
    },
    {
      path: '/analytics/reports',
      label: 'Report Builder',
      icon: BarChart3,
      allowedRoles: ['FleetManager', 'FinancialAnalyst', 'Admin'],
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: Users,
      allowedRoles: ['Admin'],
    },
    {
      path: '/admin/activity',
      label: 'Activity Log',
      icon: Activity,
      allowedRoles: ['Admin'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(role)
  );

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-300">
      {/* Brand Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-brand-600 p-1.5 text-white">
            <Truck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Transit<span className="text-brand-500">Ops</span>
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-800 p-4 bg-slate-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center space-x-2 rounded-lg border border-slate-800 bg-slate-950/40 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/50"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
