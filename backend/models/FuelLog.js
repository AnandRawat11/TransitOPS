/**
 * FuelLog.js - Mongoose model for tracking vehicle refueling.
 */
const mongoose = require('mongoose');
const { FUEL_TYPES_ARRAY } = require('../utils/constants');

const FuelLogSchema = new mongoose.Schema(
  {
    fuelLogNumber: {
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
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fuelStation: {
      type: String,
      trim: true,
      required: [true, 'Fuel station name is required'],
    },
    fuelType: {
      type: String,
      enum: {
        values: FUEL_TYPES_ARRAY,
        message: 'Fuel type must be one of: ' + FUEL_TYPES_ARRAY.join(', '),
      },
      required: true,
    },
    quantity: { // e.g. Liters or Gallons
      type: Number,
      required: true,
      min: [0.1, 'Quantity must be greater than zero'],
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: [0, 'Price per unit cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative'],
    },
    odometerReading: {
      type: Number,
      required: true,
      min: [0, 'Odometer cannot be negative'],
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: null,
    },
    receiptImage: {
      type: String, // URL to S3 or Cloudinary
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
    filledAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
FuelLogSchema.index({ fuelLogNumber: 1 });
FuelLogSchema.index({ vehicleId: 1 });
FuelLogSchema.index({ driverId: 1 });
FuelLogSchema.index({ filledAt: -1 });

// JSON Transform
FuelLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
