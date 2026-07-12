const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    licenseNumber: {
      type: String,
      unique: true,
    },
    licenseCategory: {
      type: String,
    },
    licenseExpiryDate: {
      type: Date,
    },
    contactNumber: {
      type: String,
    },
    safetyScore: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Driver', DriverSchema);
