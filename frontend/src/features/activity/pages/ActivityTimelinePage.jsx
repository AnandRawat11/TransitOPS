import React, { useState } from 'react';
import { useRecentActivities } from '../hooks/useActivity';
import { Clock, User as UserIcon, Truck, Activity, Shield, FileText, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const MODULE_ICONS = {
  'AUTH': Shield,
  'VEHICLES': Truck,
  'TRIPS': Activity,
  'MAINTENANCE': Clock,
  'EXPENSE': FileText,
  'AI': Database,
};

const ActivityTimelinePage = () => {
  const [filter, setFilter] = useState('');
  const { data: activityData, isLoading } = useRecentActivities(filter);
  const activities = activityData?.data || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Activity Timeline</h1>
          <p className="text-slate-600">Enterprise audit trail and activity log</p>
        </div>
        <select 
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Modules</option>
          <option value="AUTH">Authentication</option>
          <option value="VEHICLES">Vehicles</option>
          <option value="TRIPS">Trips</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading timeline...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No recent activity found.</div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8">
            {activities.map((act, index) => {
              const Icon = MODULE_ICONS[act.module] || Activity;
              return (
                <motion.div 
                  key={act._id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-[17px] top-1 bg-white border-2 border-blue-500 rounded-full p-1.5 shadow-sm">
                    <Icon size={14} className="text-blue-500" />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {act.user?.profileImage ? (
                            <img src={act.user.profileImage} alt="User" className="w-full h-full rounded-full" />
                          ) : (
                            <UserIcon size={12} />
                          )}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">
                          {act.user ? act.user.name : 'System User'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-200 rounded text-slate-600">
                          {act.action}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{act.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimelinePage;
