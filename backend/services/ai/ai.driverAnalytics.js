/**
 * ai.driverAnalytics.js
 * Deterministic AI module for generating driver safety and efficiency scores.
 */
const User = require('../../models/User');
const Trip = require('../../models/Trip');

/**
 * Generate a Driver Performance Report.
 */
exports.analyzeDriverPerformance = async (driverId) => {
  const driver = await User.findById(driverId);
  if (!driver || !['DRIVER'].includes(driver.role)) {
    throw new Error('Valid Driver not found');
  }

  const trips = await Trip.find({ driver: driverId });
  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const cancelledTrips = trips.filter(t => t.status === 'CANCELLED');

  let safetyScore = 100;
  let efficiencyScore = 100;
  const contributingFactors = [];

  if (trips.length === 0) {
    return {
      prediction: 'Insufficient Data',
      confidenceScore: 100,
      reasoning: 'Driver has not logged any trips yet.',
      contributingFactors: ['No trips found.'],
      suggestedAction: 'Assign driver to new trips to build a performance profile.'
    };
  }

  // Factor: Completion Rate
  const completionRate = (completedTrips.length / trips.length) * 100;
  if (completionRate < 80) {
    efficiencyScore -= 20;
    contributingFactors.push(`Low trip completion rate (${completionRate.toFixed(1)}%).`);
  }

  // Factor: Route Adherence (Mock metric based on delay logic if available, assuming on-time)
  // For deterministic phase, we'll penalize efficiency if cancelled trips exist
  if (cancelledTrips.length > 0) {
    safetyScore -= (cancelledTrips.length * 5);
    contributingFactors.push(`${cancelledTrips.length} cancelled trips on record.`);
  }

  // Cap scores
  safetyScore = Math.max(0, safetyScore);
  efficiencyScore = Math.max(0, efficiencyScore);
  
  const overallRating = (safetyScore + efficiencyScore) / 2;

  let prediction, reasoning, suggestedAction;
  if (overallRating >= 90) {
    prediction = 'Excellent Performer';
    reasoning = 'Driver consistently completes trips safely and efficiently.';
    suggestedAction = 'Consider for premium routes or safety bonuses.';
  } else if (overallRating >= 70) {
    prediction = 'Average Performer';
    reasoning = 'Driver performs adequately with some minor infractions or delays.';
    suggestedAction = 'Provide standard feedback during next review.';
  } else {
    prediction = 'High-Risk Driver';
    reasoning = 'Driver exhibits significant performance or safety degradation.';
    suggestedAction = 'Require mandatory safety retraining before next dispatch.';
  }

  return {
    driverId: driver._id,
    driverName: driver.name,
    prediction,
    confidenceScore: 90, // Strong confidence based on historical data
    scores: {
      safetyScore,
      efficiencyScore,
      overallRating
    },
    reasoning,
    contributingFactors,
    suggestedAction
  };
};

/**
 * Generate rankings for all active drivers.
 */
exports.rankAllDrivers = async () => {
  const drivers = await User.find({ role: 'DRIVER', isActive: true });
  const reports = await Promise.all(drivers.map(d => this.analyzeDriverPerformance(d._id)));
  
  // Exclude insufficient data and sort by rating
  return reports
    .filter(r => r.prediction !== 'Insufficient Data')
    .sort((a, b) => b.scores.overallRating - a.scores.overallRating);
};
