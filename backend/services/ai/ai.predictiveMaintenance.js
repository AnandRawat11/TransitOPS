/**
 * ai.predictiveMaintenance.js
 * Deterministic AI module for predicting vehicle maintenance needs.
 */
const Vehicle = require('../../models/Vehicle');
const Maintenance = require('../../models/Maintenance');

/**
 * Generate a predictive maintenance report for a specific vehicle.
 * Factors: Age, Odometer, Maintenance Frequency.
 */
exports.predictVehicleMaintenance = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  const history = await Maintenance.find({ vehicleId, status: 'COMPLETED' }).sort({ completedAt: -1 });
  
  let riskScore = 0; // 0-100 (Higher is worse)
  const contributingFactors = [];

  // 1. Odometer Factor
  // Assume a vehicle needs major service every 10,000 miles. 
  const milesSinceService = history.length > 0 && history[0].odometerAtCompletion
    ? vehicle.odometer - history[0].odometerAtCompletion
    : vehicle.odometer;

  if (milesSinceService > 8000) {
    riskScore += 40;
    contributingFactors.push(`High mileage since last service (${milesSinceService} miles).`);
  } else if (milesSinceService > 5000) {
    riskScore += 20;
    contributingFactors.push(`Moderate mileage since last service (${milesSinceService} miles).`);
  }

  // 2. Age Factor
  const ageYears = new Date().getFullYear() - vehicle.year;
  if (ageYears > 10) {
    riskScore += 30;
    contributingFactors.push(`Vehicle age exceeds 10 years (${ageYears} years old).`);
  } else if (ageYears > 5) {
    riskScore += 15;
    contributingFactors.push(`Vehicle is getting older (${ageYears} years old).`);
  }

  // 3. Maintenance Frequency
  const breakdownCount = history.filter(h => h.maintenanceType === 'EMERGENCY' || h.maintenanceType === 'CORRECTIVE').length;
  if (breakdownCount > 3) {
    riskScore += 30;
    contributingFactors.push(`High historical breakdown frequency (${breakdownCount} corrective/emergency jobs).`);
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  // Formulate Explainable AI output
  let prediction, suggestedAction, reasoning;
  if (riskScore > 75) {
    prediction = 'High Failure Probability';
    reasoning = 'Multiple risk factors breached critical thresholds. Immediate attention required.';
    suggestedAction = 'Schedule a comprehensive PREVENTIVE maintenance job immediately.';
  } else if (riskScore > 40) {
    prediction = 'Moderate Failure Probability';
    reasoning = 'Some wear-and-tear indicators are elevated. Nearing regular service window.';
    suggestedAction = 'Schedule a routine inspection in the next 14 days.';
  } else {
    prediction = 'Low Failure Probability';
    reasoning = 'Vehicle operating within optimal parameters with recent service history.';
    suggestedAction = 'Continue normal operations.';
  }

  return {
    vehicleId: vehicle._id,
    registrationNumber: vehicle.registrationNumber,
    prediction,
    confidenceScore: 85, // Deterministic algorithm confidence
    riskScore,
    reasoning,
    contributingFactors: contributingFactors.length > 0 ? contributingFactors : ['All telemetry normal.'],
    suggestedAction
  };
};

/**
 * Scan entire fleet for at-risk vehicles.
 */
exports.scanFleetMaintenanceRisk = async () => {
  const vehicles = await Vehicle.find({ isActive: true });
  const reports = await Promise.all(vehicles.map(v => this.predictVehicleMaintenance(v._id)));
  
  // Return only vehicles with Moderate to High risk
  return reports
    .filter(r => r.riskScore >= 40)
    .sort((a, b) => b.riskScore - a.riskScore); // Highest risk first
};
