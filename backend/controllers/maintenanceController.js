const MaintenanceLog = require('../models/MaintenanceLog');

const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await MaintenanceLog.find().populate('vehicle');
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const getMaintenanceLogById = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id).populate('vehicle');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const updateMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance log not found' });
    }
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

const deleteMaintenanceLog = async (req, res, next) => {
  try {
    const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance log not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};
