import React from 'react';
import { useFleetHealth, usePredictiveMaintenance, useCostPrediction } from '../hooks/useAI';
import { Activity, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AiDashboardPage = () => {
  const { data: healthData, isLoading: loadingHealth } = useFleetHealth();
  const { data: maintenanceData, isLoading: loadingMnt } = usePredictiveMaintenance();
  const { data: costData, isLoading: loadingCost } = useCostPrediction();

  if (loadingHealth || loadingMnt || loadingCost) {
    return <div className="p-8 text-center text-slate-500">Initializing AI Models...</div>;
  }

  const health = healthData?.data;
  const maintenanceRisks = maintenanceData?.data || [];
  const cost = costData?.data;

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fleet Intelligence Dashboard</h1>
        <p className="text-slate-600">AI-powered analytics and predictive insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Health Score Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Fleet Health Score</p>
              <h2 className={`text-4xl font-black mt-2 ${getHealthColor(health?.prediction)}`}>
                {health?.prediction} <span className="text-lg text-slate-400">/ 100</span>
              </h2>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <Activity className={getHealthColor(health?.prediction)} size={24} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">AI Reasoning:</p>
            <p className="text-sm text-slate-500 mt-1">{health?.reasoning}</p>
          </div>
        </div>

        {/* Cost Prediction Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Predicted Next Month Cost</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">{cost?.prediction}</h2>
              <div className={`inline-flex items-center gap-1 mt-1 text-sm font-medium ${cost?.trendPercent > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                <TrendingUp size={16} className={cost?.trendPercent > 0 ? '' : 'rotate-180'} />
                {cost?.trendPercent > 0 ? '+' : ''}{cost?.trendPercent}% vs last month
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">Suggested Action:</p>
            <p className="text-sm text-slate-500 mt-1">{cost?.suggestedAction}</p>
          </div>
        </div>

        {/* Maintenance Risk Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Vehicles at Risk</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">{maintenanceRisks.length}</h2>
              <p className="text-sm text-amber-600 font-medium mt-1">Require predictive maintenance</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Wrench size={24} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link to="/ai/copilot" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ask Copilot for details <TrendingUp size={14} className="rotate-90" />
            </Link>
          </div>
        </div>

      </div>

      {/* Detailed Risk Table */}
      {maintenanceRisks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle className="text-rose-500" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Critical Maintenance Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4 font-medium">Vehicle</th>
                  <th className="p-4 font-medium">Risk Score</th>
                  <th className="p-4 font-medium">Prediction</th>
                  <th className="p-4 font-medium">AI Suggestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceRisks.map((risk, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{risk.registrationNumber}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${risk.riskScore > 75 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {risk.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{risk.prediction}</td>
                    <td className="p-4 text-sm text-slate-600">{risk.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiDashboardPage;
