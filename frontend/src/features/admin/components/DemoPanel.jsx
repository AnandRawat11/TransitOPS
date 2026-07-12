import React, { useState } from 'react';
import api from '@/api/axios';
import { Sparkles, Trash2, Presentation } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const DemoPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/demo/seed');
      if(res.data.success) {
        toast.success(res.data.message || 'Demo data injected');
        queryClient.invalidateQueries(); // Refresh everything instantly
      }
    } catch (error) {
      toast.error('Failed to inject demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/demo/reset');
      if(res.data.success) {
        toast.success(res.data.message || 'Demo data wiped');
        queryClient.invalidateQueries();
      }
    } catch (error) {
      toast.error('Failed to wipe demo data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-xl mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Presentation className="text-blue-300" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Hackathon Demo Mode</h3>
          <p className="text-blue-200 text-sm">Instantly populate the dashboard with realistic data.</p>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handleSeed}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <Sparkles size={16} />
          Inject Demo Data
        </button>
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className="flex items-center gap-2 bg-rose-500/20 text-rose-200 border border-rose-500/30 px-4 py-2 rounded-lg font-bold text-sm hover:bg-rose-500/30 transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          Wipe Demo Data
        </button>
      </div>
    </div>
  );
};

export default DemoPanel;
