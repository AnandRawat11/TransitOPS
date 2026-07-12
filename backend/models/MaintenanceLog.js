const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    type: {
      type: String,
    },
    description: {
      type: String,
    },
    cost: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed'],
      default: 'Active',
    },
    startDate: {
      type: Date,
    },
    closedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
