/**
 * Activity.js - Mongoose model for tracking system activity (Timeline & Audit).
 */
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means system action
    },
    action: {
      type: String,
      required: true, // e.g. 'CREATED', 'UPDATED', 'DELETED', 'LOGIN'
      trim: true,
    },
    module: {
      type: String,
      required: true, // e.g. 'VEHICLES', 'TRIPS', 'AUTH', 'AI'
      trim: true,
    },
    entityType: {
      type: String,
      default: null, // e.g. 'Vehicle', 'Trip'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ user: 1 });
ActivitySchema.index({ module: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
