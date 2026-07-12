/**
 * ai.service.js
 * Main orchestration service for the AI Intelligence Module.
 */
const { predictVehicleMaintenance, scanFleetMaintenanceRisk } = require('./ai.predictiveMaintenance');
const { predictMonthlyCosts } = require('./ai.costPrediction');
const { analyzeDriverPerformance, rankAllDrivers } = require('./ai.driverAnalytics');
const { analyzeFuelEfficiency, scanFleetFuelAnomalies } = require('./ai.fuelIntelligence');
const { processChatPrompt } = require('./ai.copilot');
const Vehicle = require('../../models/Vehicle');
const Trip = require('../../models/Trip');

/**
 * Calculate the overall Fleet Health Score (0-100).
 * Combines availability, maintenance risks, and fuel anomalies.
 */
const calculateFleetHealth = async () => {
  const totalVehicles = await Vehicle.countDocuments({ isActive: true });
  if (totalVehicles === 0) return { score: 0, status: 'UNKNOWN', reasoning: 'No active vehicles.' };

  const maintenanceVehicles = await Vehicle.countDocuments({ status: 'MAINTENANCE', isActive: true });
  const maintenanceRisks = await scanFleetMaintenanceRisk();
  const fuelAnomalies = await scanFleetFuelAnomalies();

  let score = 100;
  const penalties = [];

  // 1. Availability Penalty
  const unavailablePercent = (maintenanceVehicles / totalVehicles) * 100;
  if (unavailablePercent > 20) {
    score -= 20;
    penalties.push(`High downtime: ${unavailablePercent.toFixed(1)}% of fleet is currently in maintenance.`);
  } else if (unavailablePercent > 10) {
    score -= 10;
    penalties.push(`${unavailablePercent.toFixed(1)}% of fleet is in maintenance.`);
  }

  // 2. Predictive Maintenance Penalty
  const riskPercent = (maintenanceRisks.length / totalVehicles) * 100;
  if (riskPercent > 15) {
    score -= 25;
    penalties.push(`High risk: ${riskPercent.toFixed(1)}% of fleet predicted to fail soon.`);
  } else if (riskPercent > 0) {
    score -= (riskPercent); // Scale penalty
    penalties.push(`${maintenanceRisks.length} vehicle(s) flagged for maintenance risk.`);
  }

  // 3. Fuel Anomaly Penalty
  if (fuelAnomalies.length > 0) {
    score -= (fuelAnomalies.length * 5); // 5 points per anomaly
    penalties.push(`${fuelAnomalies.length} vehicle(s) flagged for severe fuel inefficiency or anomalies.`);
  }

  score = Math.max(0, Math.floor(score));

  let status, reasoning, suggestedAction;
  if (score >= 90) {
    status = 'EXCELLENT';
    reasoning = 'Fleet is operating efficiently with minimal downtime and low predictive risk.';
    suggestedAction = 'Maintain current operational protocols.';
  } else if (score >= 70) {
    status = 'GOOD';
    reasoning = 'Fleet is stable but requires minor attention to specific vehicles.';
    suggestedAction = 'Review AI alerts for predictive maintenance and fuel anomalies.';
  } else if (score >= 50) {
    status = 'WARNING';
    reasoning = 'Significant operational inefficiencies and breakdown risks detected.';
    suggestedAction = 'Immediate audit of flagged vehicles and schedule preventive maintenance.';
  } else {
    status = 'CRITICAL';
    reasoning = 'Fleet health is severely compromised. High probability of operational failure.';
    suggestedAction = 'Ground high-risk vehicles immediately. Implement emergency maintenance protocols.';
  }

  return {
    prediction: score, // The score itself is the prediction
    confidenceScore: 95, // High confidence, deterministic
    status,
    reasoning,
    contributingFactors: penalties.length > 0 ? penalties : ['All metrics nominal.'],
    suggestedAction
  };
};

module.exports = {
  calculateFleetHealth,
  predictVehicleMaintenance,
  scanFleetMaintenanceRisk,
  predictMonthlyCosts,
  analyzeDriverPerformance,
  rankAllDrivers,
  analyzeFuelEfficiency,
  scanFleetFuelAnomalies,
  processChatPrompt
};
