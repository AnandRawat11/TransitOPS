/**
 * notification.service.js
 * Listens to eventBus and creates System Notifications for users.
 * Provides APIs to fetch and manage user notifications.
 */
const Notification = require('../models/Notification');
const User = require('../models/User');
const eventBus = require('../utils/eventBus');

// ──────────────────────────────────────
// HELPER
// ──────────────────────────────────────
const notifyAdmins = async (payload) => {
  const admins = await User.find({ role: { $in: ['ADMIN', 'FLEET_MANAGER'] }, isActive: true });
  const notifications = admins.map(admin => ({
    ...payload,
    recipient: admin._id,
  }));
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }
};

// ──────────────────────────────────────
// EVENT LISTENERS
// ──────────────────────────────────────

eventBus.on('MAINTENANCE_SCHEDULED', async (data) => {
  try {
    await notifyAdmins({
      title: 'Maintenance Scheduled',
      message: `Maintenance ${data.maintenanceNumber} scheduled for vehicle.`,
      type: 'MAINTENANCE',
      priority: 'MEDIUM',
      module: 'MAINTENANCE',
    });
  } catch (err) {
    console.error('Failed to create Notification: MAINTENANCE_SCHEDULED', err);
  }
});

eventBus.on('AI_ALERT_TRIGGERED', async (data) => {
  try {
    await notifyAdmins({
      title: 'AI Alert: ' + data.title,
      message: data.message,
      type: 'AI_ALERT',
      priority: data.priority || 'HIGH',
      module: 'AI',
    });
  } catch (err) {
    console.error('Failed to create Notification: AI_ALERT_TRIGGERED', err);
  }
});

// Generic trigger
eventBus.on('NOTIFICATION_CREATE', async (data) => {
  try {
    if (data.recipient === 'ADMINS') {
      await notifyAdmins(data);
    } else {
      await Notification.create(data);
    }
  } catch (err) {
    console.error('Failed to create Notification: NOTIFICATION_CREATE', err);
  }
});

// ──────────────────────────────────────
// API METHODS
// ──────────────────────────────────────

exports.getUserNotifications = async (userId, query = {}) => {
  const { unreadOnly = false, limit = 50 } = query;
  
  const filter = { recipient: userId };
  if (unreadOnly === 'true' || unreadOnly === true) {
    filter.isRead = false;
  }

  return await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10));
};

exports.getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, isRead: false });
};

exports.markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

exports.markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
};

exports.deleteNotification = async (notificationId, userId) => {
  await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  return { success: true };
};
