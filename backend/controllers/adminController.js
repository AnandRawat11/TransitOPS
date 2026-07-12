/**
 * adminController.js
 */
const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getUsers = catchAsync(async (req, res) => {
  const users = await adminService.getUsers(req.query);
  sendSuccess(res, 200, 'Users retrieved', users);
});

exports.updateUserRole = catchAsync(async (req, res) => {
  const user = await adminService.updateUserRole(req.params.id, req.body.role);
  sendSuccess(res, 200, 'User role updated', user);
});

exports.toggleUserStatus = catchAsync(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id);
  sendSuccess(res, 200, 'User status toggled', user);
});
