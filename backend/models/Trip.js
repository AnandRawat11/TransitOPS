const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema(
  {
    source: {
      type: String,
    },
    destination: {
      type: String,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    cargoWeight: {
      type: Number,
    },
    plannedDistance: {
      type: Number,
    },
    actualDistance: {
      type: Number,
    },
    fuelConsumed: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dispatchedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', TripSchema);
