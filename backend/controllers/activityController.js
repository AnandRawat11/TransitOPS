/**
 * activityController.js
 */
const activityService = require('../services/activity.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getRecentActivities = catchAsync(async (req, res) => {
  const activities = await activityService.getRecentActivities(req.query);
  sendSuccess(res, 200, 'Activities retrieved', activities);
});
