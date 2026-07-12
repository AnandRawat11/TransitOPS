/**
 * maintenanceDashboardController.js - Maintenance dashboard endpoints.
 */
const maintenanceService = require('../services/maintenance.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getSummary = catchAsync(async (req, res) => {
  const summary = await maintenanceService.getDashboardSummary();
  sendSuccess(res, 200, 'Maintenance dashboard summary retrieved', summary);
});

const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await maintenanceService.getDashboardAnalytics();
  sendSuccess(res, 200, 'Maintenance dashboard analytics retrieved', analytics);
});

module.exports = {
  getSummary,
  getAnalytics
};
