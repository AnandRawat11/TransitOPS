const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedVehicle', 'name registrationNumber');
    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving drivers' });
  }
};

// @desc    Get available drivers
// @route   GET /api/drivers/available
// @access  Private
const getAvailableDrivers = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDrivers = await Driver.find({
      status: 'Available',
      licenseExpiryDate: { $gte: today },
    }).select('_id name employeeId licenseNumber licenseCategory safetyScore');

    res.json({ success: true, data: availableDrivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving available drivers' });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('assignedVehicle', 'name registrationNumber');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving driver' });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private (Safety Officer, Fleet Manager)
const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate field value entered (Employee ID or License Number)' });
    }
    res.status(400).json({ success: false, message: error.message || 'Error creating driver' });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Safety Officer, Fleet Manager)
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate field value entered' });
    }
    res.status(400).json({ success: false, message: error.message || 'Error updating driver' });
  }
};

// @desc    Update driver status
// @route   PUT /api/drivers/:id/status
// @access  Private (Safety Officer, Fleet Manager)
const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Error updating driver status' });
  }
};

// @desc    Update driver safety score
// @route   PUT /api/drivers/:id/safety-score
// @access  Private (Safety Officer only)
const updateSafetyScore = async (req, res) => {
  try {
    const { safetyScore } = req.body;
    if (safetyScore === undefined) {
      return res.status(400).json({ success: false, message: 'Safety score is required' });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { safetyScore },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Error updating safety score' });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private (Fleet Manager only)
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting driver' });
  }
};

module.exports = {
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  updateDriverStatus,
  updateSafetyScore,
  deleteDriver,
};
