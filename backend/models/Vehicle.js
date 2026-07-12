const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    maxLoadCapacity: {
      type: Number,
    },
    odometer: {
      type: Number,
    },
    acquisitionCost: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available',
    },
    region: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', VehicleSchema);
