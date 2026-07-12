/**
 * ScheduledReport.js - Mongoose model for scheduled BI reports.
 */
const mongoose = require('mongoose');

const ScheduledReportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['FLEET', 'TRIPS', 'DRIVERS', 'MAINTENANCE', 'FUEL', 'EXPENSES'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
      required: true,
    },
    format: {
      type: String,
      enum: ['PDF', 'EXCEL', 'CSV'],
      default: 'PDF',
    },
    recipients: [{
      type: String,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    }],
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    nextRunAt: {
      type: Date,
      default: null, // Simulated for now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScheduledReport', ScheduledReportSchema);
