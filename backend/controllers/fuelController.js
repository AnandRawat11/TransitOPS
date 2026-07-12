const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');

// @desc    Get all fuel logs
// @route   GET /api/fuel
// @access  Private
const getFuelLogs = async (req, res, next) => {
  try {
    const { vehicleId } = req.query;
    let query = {};
    if (vehicleId) {
      query.vehicle = vehicleId;
    }

    const logs = await FuelLog.find(query)
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fuel log by ID
// @route   GET /api/fuel/:id
// @access  Private
const getFuelLogById = async (req, res, next) => {
  try {
    const log = await FuelLog.findById(req.params.id).populate('vehicle').populate('trip');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new fuel log
// @route   POST /api/fuel
// @access  Private (Driver / FleetManager)
const createFuelLog = async (req, res, next) => {
  try {
    const { vehicle, trip, liters, cost, date } = req.body;

    if (!vehicle || !liters || !cost || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle, liters, cost, and date.',
      });
    }

    // Verify vehicle exists
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    const newLog = await FuelLog.create({
      vehicle,
      trip: trip || undefined,
      liters,
      cost,
      date,
    });

    const populatedLog = await FuelLog.findById(newLog._id)
      .populate('vehicle')
      .populate('trip');

    res.status(201).json({
      success: true,
      data: populatedLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a fuel log
// @route   PUT /api/fuel/:id
// @access  Private
const updateFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle').populate('trip');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a fuel log entry
// @route   DELETE /api/fuel/:id
// @access  Private (FleetManager only)
const deleteFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Fuel log entry not found',
      });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fuel log entry removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFuelLogs,
  getFuelLogById,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
};
