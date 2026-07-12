/**
 * Notification.js - Mongoose model for system notifications.
 */
const mongoose = require('mongoose');
const { NOTIFICATION_TYPES_ARRAY, NOTIFICATION_PRIORITY_ARRAY } = require('../utils/constants');

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES_ARRAY,
      default: 'INFO',
    },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_ARRAY,
      default: 'LOW',
    },
    module: {
      type: String, // 'VEHICLES', 'TRIPS', 'MAINTENANCE', 'FUEL', 'EXPENSE', 'AI', 'SYSTEM'
      trim: true,
      default: 'SYSTEM',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Tied to a specific user
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: null, // Optional link to click
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
