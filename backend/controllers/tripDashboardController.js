/**
 * tripDashboardController.js - Trip dashboard endpoints.
 */
const tripService = require('../services/trip.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const getSummary = catchAsync(async (req, res) => {
  const summary = await tripService.getDashboardSummary();
  sendSuccess(res, 200, 'Trip dashboard summary retrieved', summary);
});

const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await tripService.getDashboardAnalytics();
  sendSuccess(res, 200, 'Trip dashboard analytics retrieved', analytics);
});

module.exports = {
  getSummary,
  getAnalytics
};
