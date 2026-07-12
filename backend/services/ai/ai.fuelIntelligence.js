/**
 * ai.fuelIntelligence.js
 * Deterministic AI module for detecting fuel anomalies and efficiency degradation.
 */
const FuelLog = require('../../models/FuelLog');
const Vehicle = require('../../models/Vehicle');

/**
 * Analyze fuel consumption for a vehicle to detect anomalies or theft.
 */
exports.analyzeFuelEfficiency = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  const logs = await FuelLog.find({ vehicleId }).sort({ filledAt: 1 }); // Oldest to newest
  
  if (logs.length < 2) {
    return {
      prediction: 'Insufficient Data',
      confidenceScore: 100,
      reasoning: 'Need at least 2 fuel logs to calculate fuel economy (MPG/Liters per 100km).',
      contributingFactors: [`Only ${logs.length} log(s) found.`],
      suggestedAction: 'Continue logging fuel fills.'
    };
  }

  let totalDistance = 0;
  let totalFuel = 0;
  const contributingFactors = [];

  // Calculate overall MPG and check for sudden drops
  for (let i = 1; i < logs.length; i++) {
    const distanceDriven = logs[i].odometerReading - logs[i-1].odometerReading;
    const fuelUsed = logs[i].quantity; // Quantity filled represents fuel used since last fill
    
    if (distanceDriven < 0) {
      contributingFactors.push(`Odometer rollback detected between log ${logs[i-1].fuelLogNumber} and ${logs[i].fuelLogNumber}.`);
    } else {
      totalDistance += distanceDriven;
      totalFuel += fuelUsed;
    }
  }

  const averageFuelEconomy = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;
  
  // Evaluate latest log against average
  const latestLog = logs[logs.length - 1];
  const previousLog = logs[logs.length - 2];
  const latestDistance = latestLog.odometerReading - previousLog.odometerReading;
  const latestFuelEconomy = latestLog.quantity > 0 ? (latestDistance / latestLog.quantity) : 0;

  const efficiencyDrop = averageFuelEconomy > 0 
    ? ((averageFuelEconomy - latestFuelEconomy) / averageFuelEconomy) * 100 
    : 0;

  let prediction, reasoning, suggestedAction;

  if (contributingFactors.length > 0) {
    prediction = 'Severe Anomaly Detected (Odometer Tampering)';
    reasoning = 'Odometer readings dropped between logs, heavily indicating tampering or data entry errors.';
    suggestedAction = 'Audit vehicle odometer immediately and review driver logs.';
  } else if (efficiencyDrop > 30) {
    prediction = 'High Fuel Theft / Leak Risk';
    reasoning = `Fuel economy dropped by ${efficiencyDrop.toFixed(1)}% compared to historical average.`;
    contributingFactors.push(`Historical Avg: ${averageFuelEconomy} units. Latest: ${latestFuelEconomy.toFixed(2)} units.`);
    suggestedAction = 'Inspect fuel tank for leaks and audit driver route/refueling behavior.';
  } else if (efficiencyDrop > 15) {
    prediction = 'Moderate Efficiency Degradation';
    reasoning = `Fuel economy dropped by ${efficiencyDrop.toFixed(1)}%. Engine may require tuning.`;
    contributingFactors.push(`Historical Avg: ${averageFuelEconomy} units. Latest: ${latestFuelEconomy.toFixed(2)} units.`);
    suggestedAction = 'Schedule engine diagnostic and check tire pressure.';
  } else {
    prediction = 'Normal Consumption';
    reasoning = 'Fuel economy is stable and within historical parameters.';
    contributingFactors.push(`Maintaining ${averageFuelEconomy} units fuel economy.`);
    suggestedAction = 'No action required.';
  }

  return {
    vehicleId: vehicle._id,
    registrationNumber: vehicle.registrationNumber,
    prediction,
    confidenceScore: 85,
    metrics: {
      averageFuelEconomy,
      latestFuelEconomy: latestFuelEconomy.toFixed(2),
      efficiencyDropPercent: efficiencyDrop.toFixed(1)
    },
    reasoning,
    contributingFactors,
    suggestedAction
  };
};

/**
 * Scan fleet for fuel anomalies.
 */
exports.scanFleetFuelAnomalies = async () => {
  const vehicles = await Vehicle.find({ isActive: true });
  const reports = await Promise.all(vehicles.map(v => this.analyzeFuelEfficiency(v._id)));
  
  return reports
    .filter(r => r.prediction !== 'Normal Consumption' && r.prediction !== 'Insufficient Data')
    .sort((a, b) => b.metrics?.efficiencyDropPercent - a.metrics?.efficiencyDropPercent);
};
