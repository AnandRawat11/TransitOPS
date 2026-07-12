/**
 * aiController.js
 * Exposes AI Service methods to API endpoints.
 */
const aiService = require('../services/ai/ai.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getFleetHealth = catchAsync(async (req, res) => {
  const result = await aiService.calculateFleetHealth();
  sendSuccess(res, 200, 'Fleet Health calculated', result);
});

exports.getPredictiveMaintenance = catchAsync(async (req, res) => {
  const result = await aiService.scanFleetMaintenanceRisk();
  sendSuccess(res, 200, 'Predictive Maintenance risks retrieved', result);
});

exports.getFuelAnalysis = catchAsync(async (req, res) => {
  const result = await aiService.scanFleetFuelAnomalies();
  sendSuccess(res, 200, 'Fuel anomalies retrieved', result);
});

exports.getDriverPerformance = catchAsync(async (req, res) => {
  const result = await aiService.rankAllDrivers();
  sendSuccess(res, 200, 'Driver performance rankings retrieved', result);
});

exports.getCostPrediction = catchAsync(async (req, res) => {
  const result = await aiService.predictMonthlyCosts();
  sendSuccess(res, 200, 'Cost prediction retrieved', result);
});

exports.chatCopilot = catchAsync(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) throw new Error('Prompt is required');
  
  const responseMarkdown = await aiService.processChatPrompt(prompt);
  
  sendSuccess(res, 200, 'Copilot response generated', {
    response: responseMarkdown
  });
});
