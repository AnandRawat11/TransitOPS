const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

const getMaintenanceLogs = async (req, res, next) => {
  try {
    const { vehicleId, status } = req.query;
    const query = {};

    if (vehicleId) {
      query.vehicle = vehicleId;
    }
    if (status) {
      query.status = status;
    }

    const logs = await MaintenanceLog.find(query)
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicle, maintenanceType, description, cost } = req.body;

    // 1. Validate required fields
    if (!vehicle || !maintenanceType || !description || cost == null) {
      return res.status(400).json({
        success: false,
        message: 'vehicle, maintenanceType, description, and cost are required fields',
      });
    }

    // 2. Fetch Vehicle
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    if (vehicleDoc.status === 'Retired') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is retired and cannot undergo maintenance',
      });
    }

    // 3. Create MaintenanceLog
    const maintenanceLog = new MaintenanceLog({
      vehicle,
      type: maintenanceType,
      description,
      cost,
      status: 'Active',
      startDate: new Date(),
    });

    // 4. Update Vehicle status
    vehicleDoc.status = 'In Shop';

    // 5. Save both documents
    await maintenanceLog.save();
    await vehicleDoc.save();

    // 6. Return HTTP 201
    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenanceLog,
    });
  } catch (error) {
    next(error);
  }
};

const closeMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find the MaintenanceLog
    const maintenanceLog = await MaintenanceLog.findById(id);
    if (!maintenanceLog) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance log not found',
      });
    }

    // 2. Allow closing only if status === "Active"
    if (maintenanceLog.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Maintenance record is already closed or not active',
      });
    }

    // 3. Fetch the associated Vehicle
    const vehicleDoc = await Vehicle.findById(maintenanceLog.vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle associated with the maintenance log not found',
      });
    }

    // 4. Update MaintenanceLog
    maintenanceLog.status = 'Closed';
    maintenanceLog.closedDate = new Date();

    // 5. If vehicle.status !== "Retired", update to "Available"
    if (vehicleDoc.status !== 'Retired') {
      vehicleDoc.status = 'Available';
    }

    // 6. Save both documents
    await maintenanceLog.save();
    await vehicleDoc.save();

    // 7. Return HTTP 200
    res.status(200).json({
      success: true,
      message: 'Maintenance closed successfully',
      data: maintenanceLog,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenance,
};
