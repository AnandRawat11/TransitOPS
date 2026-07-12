/**
 * ai.copilot.js
 * Intent-matching engine simulating an AI Assistant for the Fleet Manager.
 */
const { predictMonthlyCosts } = require('./ai.costPrediction');
const { scanFleetMaintenanceRisk } = require('./ai.predictiveMaintenance');
const { scanFleetFuelAnomalies } = require('./ai.fuelIntelligence');
const { rankAllDrivers } = require('./ai.driverAnalytics');
const Vehicle = require('../../models/Vehicle');
const Trip = require('../../models/Trip');

/**
 * Process natural language queries (simulated via regex/keyword mapping).
 * Designed to be swapped with an LLM later by simply replacing this function's internals.
 */
exports.processChatPrompt = async (prompt) => {
  const query = prompt.toLowerCase();
  
  if (query.includes('maintenance') || query.includes('service') || query.includes('breakdown')) {
    const risks = await scanFleetMaintenanceRisk();
    if (risks.length === 0) {
      return "✅ **Great news!** According to my predictive models, there are currently no vehicles at moderate or high risk of breakdown. The fleet is operating optimally.";
    }
    
    let markdown = "⚠️ **Maintenance Alert**\n\nI have identified the following vehicles that require attention:\n\n";
    risks.forEach(r => {
      markdown += `- **Vehicle ${r.registrationNumber}**: ${r.prediction}\n  - *Reasoning*: ${r.reasoning}\n  - *Action*: ${r.suggestedAction}\n`;
    });
    return markdown;
  }

  if (query.includes('cost') || query.includes('budget') || query.includes('expensive') || query.includes('expense')) {
    const costData = await predictMonthlyCosts();
    return `💰 **Cost Forecast**\n\n- **Predicted Next Month Cost**: ${costData.prediction}\n- **Trend**: ${costData.trendPercent > 0 ? '+' : ''}${costData.trendPercent}%\n\n*Reasoning*: ${costData.reasoning}\n*Action*: ${costData.suggestedAction}`;
  }

  if (query.includes('fuel') || query.includes('mpg') || query.includes('theft')) {
    const anomalies = await scanFleetFuelAnomalies();
    if (anomalies.length === 0) {
      return "✅ **Fuel Efficiency**\n\nNo significant fuel anomalies or efficiency drops detected across the active fleet.";
    }

    let markdown = "⛽ **Fuel Anomalies Detected**\n\n";
    anomalies.forEach(a => {
      markdown += `- **Vehicle ${a.registrationNumber}**: ${a.prediction}\n  - *Drop*: ${a.metrics.efficiencyDropPercent}%\n  - *Action*: ${a.suggestedAction}\n`;
    });
    return markdown;
  }

  if (query.includes('driver') || query.includes('performance') || query.includes('safety')) {
    const rankings = await rankAllDrivers();
    if (rankings.length === 0) {
      return "No driver performance data available yet.";
    }

    let markdown = "👨‍✈️ **Driver Intelligence**\n\nTop and Bottom Performers:\n\n";
    // Top 2
    markdown += "**Top Performers**\n";
    rankings.slice(0, 2).forEach(r => {
      markdown += `- **${r.driverName}**: ${r.prediction} (Score: ${r.scores.overallRating.toFixed(1)}/100)\n`;
    });
    
    // Bottom 2 if there are more than 2 drivers
    if (rankings.length > 2) {
      markdown += "\n**Requires Attention**\n";
      rankings.slice(-2).forEach(r => {
        markdown += `- **${r.driverName}**: ${r.prediction} (Score: ${r.scores.overallRating.toFixed(1)}/100)\n  - *Action*: ${r.suggestedAction}\n`;
      });
    }
    return markdown;
  }

  if (query.includes('summar') || query.includes('activity') || query.includes('today')) {
    const activeTrips = await Trip.countDocuments({ status: 'IN_PROGRESS' });
    const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'MAINTENANCE' });
    
    return `📊 **Fleet Summary**\n\n- **Active Trips**: ${activeTrips}\n- **Available Vehicles**: ${availableVehicles}\n- **Vehicles in Shop**: ${maintenanceVehicles}\n\n*Would you like me to analyze any of these specific areas?*`;
  }

  // Fallback
  return "🤖 **AI Copilot**\n\nI am your Fleet Intelligence Assistant. You can ask me to:\n- Analyze vehicles that need *maintenance*\n- Check for *fuel* theft or degradation\n- Show *driver performance*\n- Predict next month's *costs*\n- *Summarize* fleet activity";
};
