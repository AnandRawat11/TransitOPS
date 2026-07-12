const FuelLog = require('../models/FuelLog');

const getFuelLogs = async (req, res, next) => {
  try {
    const logs = await FuelLog.find().populate('vehicle').populate('trip');
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

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

const createFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const updateFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const deleteFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Fuel log not found' });
    }
    res.status(200).json({ success: true, data: {} });
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
