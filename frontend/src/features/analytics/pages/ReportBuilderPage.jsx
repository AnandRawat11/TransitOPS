import React, { useState } from 'react';
import { useExportReport, useScheduledReports, useCreateScheduledReport } from '../hooks/useAnalytics';
import { Download, CalendarClock, FileText, FileSpreadsheet, FileJson, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';

const ReportBuilderPage = () => {
  const exportMutation = useExportReport();
  const scheduleMutation = useCreateScheduledReport();
  const { data: schedulesData } = useScheduledReports();
  const schedules = schedulesData?.data || [];

  const [activeTab, setActiveTab] = useState('EXPORT'); // EXPORT or SCHEDULE
  const { register, handleSubmit, reset } = useForm();

  const handleExport = (format) => {
    exportMutation.mutate({ type: 'DASHBOARD', format });
  };

  const onSubmitSchedule = (data) => {
    scheduleMutation.mutate({
      name: data.name,
      type: 'FLEET', // Hardcoded for Phase 7 example
      frequency: data.frequency,
      format: data.format,
      recipients: data.recipients.split(',').map(e => e.trim())
    }, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Report Builder & Export</h1>
        <p className="text-slate-600">Generate instantly or schedule automated BI reports.</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('EXPORT')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'EXPORT' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Instant Export
        </button>
        <button 
          onClick={() => setActiveTab('SCHEDULE')}
          className={`pb-3 px-4 font-medium text-sm transition-colors ${activeTab === 'SCHEDULE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Scheduled Reports
        </button>
      </div>

      {activeTab === 'EXPORT' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Executive Summary Report</h3>
          <p className="text-slate-600 text-sm mb-6">Download a comprehensive snapshot of Fleet, Trips, Maintenance, and Financial KPIs.</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => handleExport('PDF')}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg font-medium hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <FileText size={18} /> Export as PDF
            </button>
            <button 
              onClick={() => handleExport('EXCEL')}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet size={18} /> Export as Excel
            </button>
            <button 
              onClick={() => handleExport('CSV')}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <FileJson size={18} /> Export as CSV
            </button>
          </div>
        </div>
      )}

      {activeTab === 'SCHEDULE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarClock size={20} className="text-blue-500" /> Create Schedule
            </h3>
            <form onSubmit={handleSubmit(onSubmitSchedule)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Name</label>
                <input {...register('name')} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Weekly Fleet Overview" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select {...register('frequency')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                  <select {...register('format')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none">
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel (.xlsx)</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipients (comma separated)</label>
                <input {...register('recipients')} required placeholder="manager@transitops.com" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button 
                type="submit" 
                disabled={scheduleMutation.isPending}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Report'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Active Schedules</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {schedules.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No scheduled reports found.</div>
              ) : (
                schedules.map(s => (
                  <div key={s._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-800">{s.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> {s.frequency}</span>
                          <span className="font-medium px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{s.format}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {s.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBuilderPage;
