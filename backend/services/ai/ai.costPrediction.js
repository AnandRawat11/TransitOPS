/**
 * ai.costPrediction.js
 * Deterministic AI module for budget and cost forecasting.
 */
const Expense = require('../../models/Expense');

/**
 * Predict next month's operating cost based on historical expense trends.
 */
exports.predictMonthlyCosts = async () => {
  const expenses = await Expense.find({ approvalStatus: 'APPROVED' });

  if (expenses.length === 0) {
    return {
      prediction: '$0.00',
      confidenceScore: 100,
      reasoning: 'No approved expenses on record to forecast.',
      contributingFactors: ['Missing historical financial data.'],
      suggestedAction: 'Ensure all operational logs are approved in the ledger.'
    };
  }

  // Aggregate costs by month-year
  const monthlyTotals = {};
  expenses.forEach(exp => {
    const d = new Date(exp.expenseDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + exp.amount;
  });

  const totalsArray = Object.values(monthlyTotals);
  
  if (totalsArray.length < 2) {
    const total = totalsArray[0] || 0;
    return {
      prediction: `$${total.toFixed(2)}`,
      confidenceScore: 60,
      reasoning: 'Insufficient historical data (less than 2 months). Prediction is simply the current month total.',
      contributingFactors: ['Only one active month of data.'],
      suggestedAction: 'Wait for more financial cycles to establish a trend line.'
    };
  }

  // Simple Moving Average (SMA) of up to last 3 months
  const recentMonths = totalsArray.slice(-3);
  const average = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
  
  // Calculate trend (is it going up or down?)
  const latest = totalsArray[totalsArray.length - 1];
  const previous = totalsArray[totalsArray.length - 2];
  const trendPercent = ((latest - previous) / (previous || 1)) * 100;
  
  // Apply a smoothing factor (+5% buffer for safety)
  const predictedCost = average * 1.05;
  
  let reasoning, suggestedAction;
  const contributingFactors = [
    `Calculated over ${recentMonths.length} recent month(s).`,
    `Trend compared to last month: ${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%.`,
    'Applied a 5% predictive buffer for unexpected expenses.'
  ];

  if (trendPercent > 15) {
    reasoning = 'Expenses are rising rapidly month-over-month.';
    suggestedAction = 'Implement immediate cost-cutting measures and audit fuel/maintenance logs.';
  } else if (trendPercent < -10) {
    reasoning = 'Expenses are trending downwards, indicating improved operational efficiency.';
    suggestedAction = 'Maintain current operational protocols.';
  } else {
    reasoning = 'Expenses are relatively stable month-over-month.';
    suggestedAction = 'Allocate budget according to the projected baseline.';
  }

  return {
    prediction: `$${predictedCost.toFixed(2)}`,
    confidenceScore: 80,
    reasoning,
    contributingFactors,
    suggestedAction,
    trendPercent: Number(trendPercent.toFixed(1))
  };
};
