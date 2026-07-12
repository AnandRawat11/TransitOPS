import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Bell, 
  Sliders, 
  ShieldAlert, 
  Check, 
  Moon, 
  Map, 
  Smartphone, 
  Mail,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || `${user?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}@transitops.com`,
    phone: '+1 (555) 019-2834',
    language: 'en-US'
  });

  const [notificationConfig, setNotificationConfig] = useState({
    emailAlerts: true,
    smsAlerts: false,
    delayAlerts: true,
    maintenanceAlerts: true
  });

  const [preferences, setPreferences] = useState({
    defaultMapMode: 'dark',
    defaultPageSize: '10',
    idleTimeout: '30'
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleNotification = (key) => {
    setNotificationConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferencesChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'system', label: 'System Integration', icon: Network }
  ];

  return (
    <div className="p-1 space-y-6 text-slate-200 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure your operator profile, notifications, and platform parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs Card */}
        <div className="md:col-span-1">
          <Card className="p-2 border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <form onSubmit={handleProfileSave}>
                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription className="text-slate-400">View and update your operations profile info.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Full Name</Label>
                        <Input 
                          id="profile-name"
                          value={profileForm.name} 
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-role">Operational Role</Label>
                        <Input 
                          id="profile-role"
                          value={user?.role || ''} 
                          disabled 
                          className="bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email">Work Email</Label>
                        <Input 
                          id="profile-email"
                          type="email"
                          value={profileForm.email} 
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-phone">Phone Number</Label>
                        <Input 
                          id="profile-phone"
                          value={profileForm.phone} 
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t border-slate-800 py-4">
                    <span className="text-xs text-slate-500">Security managed by TransitOps IAM.</span>
                    <div className="flex items-center space-x-3">
                      {savedSuccess && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse">
                          <Check className="h-3 w-3" /> Profile updated successfully!
                        </span>
                      )}
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20">
                        Save Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </form>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>System & Operations Notifications</CardTitle>
                  <CardDescription className="text-slate-400">Choose when and how you want to be notified about dispatch events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email alerts */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" /> Operational Dispatch Digests
                      </p>
                      <p className="text-xs text-slate-400">Receive summaries of active routes and delays every shift.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification('emailAlerts')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notificationConfig.emailAlerts ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationConfig.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* SMS Alerts */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-400" /> SMS Emergency Alerts
                      </p>
                      <p className="text-xs text-slate-400">Receive text notifications for high-priority mechanical alerts or delays.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification('smsAlerts')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notificationConfig.smsAlerts ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationConfig.smsAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Delay alerts */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-400" /> Trip Delay Notifications
                      </p>
                      <p className="text-xs text-slate-400">Trigger immediate alerts if any active trip falls behind schedule by 15+ minutes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification('delayAlerts')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notificationConfig.delayAlerts ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationConfig.delayAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Interface & Analytics Settings</CardTitle>
                  <CardDescription className="text-slate-400">Customize how logs and dashboards render for your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Default Theme */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Moon className="h-4 w-4 text-purple-400" /> Core Interface Styling
                      </p>
                      <p className="text-xs text-slate-400">TransitOps enforces a unified dark-mode dashboard for operational clarity.</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-md">
                      Dark Mode default
                    </span>
                  </div>

                  {/* Default Map Style */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Map className="h-4 w-4 text-blue-400" /> Default Map Projection
                      </p>
                      <p className="text-xs text-slate-400">Choose the render engine view for real-time tracking.</p>
                    </div>
                    <select
                      value={preferences.defaultMapMode}
                      onChange={(e) => handlePreferencesChange('defaultMapMode', e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-sm text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="dark">Vector Dark (High Contrast)</option>
                      <option value="satellite">Satellite Ortho</option>
                      <option value="streets">Night Routes</option>
                    </select>
                  </div>

                  {/* Page Size */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-amber-400" /> Default Grid Items Per Page
                      </p>
                      <p className="text-xs text-slate-400">Controls default row pagination across directories.</p>
                    </div>
                    <select
                      value={preferences.defaultPageSize}
                      onChange={(e) => handlePreferencesChange('defaultPageSize', e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-sm text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="10">10 Rows</option>
                      <option value="25">25 Rows</option>
                      <option value="50">50 Rows</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Platform Integration Status</CardTitle>
                  <CardDescription className="text-slate-400">Operational metadata regarding connected APIs and databases.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center space-x-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Gateway API Connection</p>
                        <p className="text-sm font-bold text-white mt-0.5">Online & Healthy</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center space-x-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Platform Version</p>
                        <p className="text-sm font-bold text-white mt-0.5">TransitOps v1.2.0-stable</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center space-x-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Client Latency</p>
                        <p className="text-sm font-bold text-white mt-0.5">14ms</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center space-x-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">Database Provider</p>
                        <p className="text-sm font-bold text-white mt-0.5">MongoDB Atlas (Replica Set)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
