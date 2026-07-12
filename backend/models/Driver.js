const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseCategory: {
      type: String,
      enum: ['Light', 'Medium', 'Heavy', 'Commercial'],
    },
    licenseIssueDate: {
      type: Date,
    },
    licenseExpiryDate: {
      type: Date,
      required: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    region: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
