/**
 * Vehicle.js - Mongoose model for fleet vehicles in TransitOps.
 *
 * Features:
 *   - Full field set: registration, make, model, year, fuel, compliance dates
 *   - Enum fields for vehicleType, fuelType, currentStatus
 *   - Compound indexes for common query patterns
 *   - Validation rules (positive numbers, year range)
 *   - isActive flag for soft deletion
 *   - toJSON transform for clean API responses
 */
const mongoose = require('mongoose');
const {
  VEHICLE_STATUS_ARRAY,
  VEHICLE_STATUS,
  VEHICLE_TYPES_ARRAY,
  FUEL_TYPES_ARRAY,
} = require('../utils/constants');

const VehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Registration number must be at least 3 characters'],
      maxlength: [20, 'Registration number must not exceed 20 characters'],
    },

    vehicleName: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      minlength: [2, 'Vehicle name must be at least 2 characters'],
      maxlength: [100, 'Vehicle name must not exceed 100 characters'],
    },

    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: VEHICLE_TYPES_ARRAY,
        message: 'Vehicle type must be one of: ' + VEHICLE_TYPES_ARRAY.join(', '),
      },
    },

    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },

    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },

    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
    },

    maxLoad: {
      type: Number,
      min: [0, 'Max load cannot be negative'],
      default: null,
    },

    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: {
        values: FUEL_TYPES_ARRAY,
        message: 'Fuel type must be one of: ' + FUEL_TYPES_ARRAY.join(', '),
      },
    },

    odometer: {
      type: Number,
      min: [0, 'Odometer reading cannot be negative'],
      default: 0,
    },

    acquisitionCost: {
      type: Number,
      min: [0, 'Acquisition cost cannot be negative'],
      default: null,
    },

    currentStatus: {
      type: String,
      enum: {
        values: VEHICLE_STATUS_ARRAY,
        message: 'Status must be one of: ' + VEHICLE_STATUS_ARRAY.join(', '),
      },
      default: VEHICLE_STATUS.AVAILABLE,
    },

    region: {
      type: String,
      trim: true,
      default: null,
    },

    chassisNumber: {
      type: String,
      trim: true,
      default: null,
    },

    insuranceExpiry: {
      type: Date,
      default: null,
    },

    fitnessExpiry: {
      type: Date,
      default: null,
    },

    pollutionExpiry: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────
// Indexes
// ──────────────────────────────────────

VehicleSchema.index({ currentStatus: 1, isActive: 1 });
VehicleSchema.index({ vehicleType: 1 });
VehicleSchema.index({ region: 1 });
VehicleSchema.index({ fuelType: 1 });

// ──────────────────────────────────────
// JSON Transform
// ──────────────────────────────────────

VehicleSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
