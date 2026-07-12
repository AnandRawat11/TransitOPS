/**
 * Trip.js - Mongoose model for TransitOps Trips.
 */
const mongoose = require('mongoose');
const { TRIP_STATUS_ARRAY, TRIP_STATUS, TRIP_PRIORITY_ARRAY, TRIP_PRIORITY } = require('../utils/constants');

const TripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
      default: null,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: false,
      default: null,
    },
    startLocation: {
      type: String,
      required: [true, 'Start location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    route: {
      type: String,
      trim: true,
      default: null,
    },
    plannedDistance: {
      type: Number,
      min: [0, 'Planned distance must be positive'],
      required: true,
    },
    actualDistance: {
      type: Number,
      min: 0,
      default: null,
    },
    plannedStartTime: {
      type: Date,
      required: true,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    plannedEndTime: {
      type: Date,
      required: true,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    tripStatus: {
      type: String,
      enum: {
        values: TRIP_STATUS_ARRAY,
        message: 'Trip status must be one of: ' + TRIP_STATUS_ARRAY.join(', '),
      },
      default: TRIP_STATUS.PLANNED,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: TRIP_STATUS_ARRAY,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    cargoType: {
      type: String,
      trim: true,
      required: true,
    },
    cargoWeight: {
      type: Number,
      min: [0, 'Cargo weight must be positive'],
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: TRIP_PRIORITY_ARRAY,
        message: 'Priority must be one of: ' + TRIP_PRIORITY_ARRAY.join(', '),
      },
      default: TRIP_PRIORITY.MEDIUM,
    },
    estimatedFuel: {
      type: Number,
      min: 0,
      default: null,
    },
    actualFuel: {
      type: Number,
      min: 0,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    startOdometer: {
      type: Number,
      min: 0,
      default: null,
    },
    endOdometer: {
      type: Number,
      min: 0,
      default: null,
    },
    delayReason: {
      type: String,
      trim: true,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
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
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TripSchema.index({ tripNumber: 1 });
TripSchema.index({ vehicleId: 1 });
TripSchema.index({ driverId: 1 });
TripSchema.index({ tripStatus: 1 });
TripSchema.index({ plannedStartTime: 1 });

// JSON Transform
TripSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Trip', TripSchema);
