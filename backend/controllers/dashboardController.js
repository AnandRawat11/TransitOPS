/**
 * dashboardController.js - Dashboard endpoints for TransitOps.
 */
const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/dashboard/summary
 * KPI summary metrics.
 */
const getSummary = catchAsync(async (req, res) => {
  const summary = await vehicleService.getFleetSummary();
  sendSuccess(res, 200, 'Fleet summary retrieved', summary);
});

/**
 * GET /api/v1/dashboard/analytics
 * Data for charts and distributions.
 */
const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await vehicleService.getFleetAnalytics();
  sendSuccess(res, 200, 'Fleet analytics retrieved', analytics);
});

module.exports = {
  getSummary,
  getAnalytics
};
