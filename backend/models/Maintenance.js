/**
 * Maintenance.js - Mongoose model for TransitOps Maintenance Logs.
 */
const mongoose = require('mongoose');
const { 
  MAINTENANCE_STATUS_ARRAY, 
  MAINTENANCE_STATUS, 
  MAINTENANCE_PRIORITY_ARRAY, 
  MAINTENANCE_PRIORITY,
  MAINTENANCE_TYPE_ARRAY,
  MAINTENANCE_TYPE
} = require('../utils/constants');

const MaintenanceSchema = new mongoose.Schema(
  {
    maintenanceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    maintenanceType: {
      type: String,
      enum: {
        values: MAINTENANCE_TYPE_ARRAY,
        message: 'Maintenance type must be one of: ' + MAINTENANCE_TYPE_ARRAY.join(', '),
      },
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: MAINTENANCE_PRIORITY_ARRAY,
        message: 'Priority must be one of: ' + MAINTENANCE_PRIORITY_ARRAY.join(', '),
      },
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: {
        values: MAINTENANCE_STATUS_ARRAY,
        message: 'Status must be one of: ' + MAINTENANCE_STATUS_ARRAY.join(', '),
      },
      default: MAINTENANCE_STATUS.REPORTED,
    },
    issueCategory: {
      type: String,
      trim: true,
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    workshopName: {
      type: String,
      trim: true,
      default: null,
    },
    serviceCenter: {
      type: String,
      trim: true,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: null,
    },
    actualCost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: null,
    },
    estimatedDuration: { // in hours
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: null,
    },
    actualDuration: { // in hours
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: null,
    },
    odometerReading: {
      type: Number,
      min: [0, 'Odometer cannot be negative'],
      default: null,
    },
    nextServiceOdometer: {
      type: Number,
      min: [0, 'Next service odometer cannot be negative'],
      default: null,
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    partsReplaced: [
      {
        partName: String,
        quantity: Number,
        cost: Number,
      }
    ],
    attachments: [
      {
        type: String, // URLs to S3/Cloud Storage
      }
    ],
    remarks: {
      type: String,
      trim: true,
      default: null,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: MAINTENANCE_STATUS_ARRAY,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MaintenanceSchema.index({ maintenanceNumber: 1 });
MaintenanceSchema.index({ vehicleId: 1 });
MaintenanceSchema.index({ assignedTechnician: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ scheduledDate: 1 });

// JSON Transform
MaintenanceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
