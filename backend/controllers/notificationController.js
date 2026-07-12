/**
 * notificationController.js
 */
const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user._id, req.query);
  sendSuccess(res, 200, 'Notifications retrieved', notifications);
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  sendSuccess(res, 200, 'Unread count retrieved', { count });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Notification marked as read', notification);
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendSuccess(res, 200, 'All notifications marked as read', null);
});

exports.deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Notification deleted', null);
});
