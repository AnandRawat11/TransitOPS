const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: false,
    },
    liters: {
      type: Number,
    },
    cost: {
      type: Number,
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FuelLog', FuelLogSchema);
