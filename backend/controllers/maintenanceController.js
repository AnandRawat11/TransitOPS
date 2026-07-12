/**
 * maintenanceController.js - Maintenance endpoints controller.
 */
const maintenanceService = require('../services/maintenance.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const createMaintenance = catchAsync(async (req, res) => {
  const mnt = await maintenanceService.createMaintenance(req.body, req.user.id);
  sendSuccess(res, 201, 'Maintenance logged successfully', mnt);
});

const getMaintenance = catchAsync(async (req, res) => {
  const result = await maintenanceService.getAllMaintenance(req.query);
  res.status(200).json({
    success: true,
    message: 'Maintenance records retrieved',
    data: result.data,
    pagination: result.pagination
  });
});

const getMaintenanceById = catchAsync(async (req, res) => {
  const mnt = await maintenanceService.getMaintenanceById(req.params.id);
  sendSuccess(res, 200, 'Maintenance record retrieved', mnt);
});

const getMaintenanceByVehicleId = catchAsync(async (req, res) => {
  const records = await maintenanceService.getMaintenanceByVehicleId(req.params.vehicleId);
  sendSuccess(res, 200, 'Vehicle maintenance history retrieved', records);
});

const getUpcoming = catchAsync(async (req, res) => {
  const records = await maintenanceService.getUpcomingMaintenance();
  sendSuccess(res, 200, 'Upcoming maintenance retrieved', records);
});

const getOverdue = catchAsync(async (req, res) => {
  const records = await maintenanceService.getOverdueMaintenance();
  sendSuccess(res, 200, 'Overdue maintenance retrieved', records);
});

const updateMaintenance = catchAsync(async (req, res) => {
  const mnt = await maintenanceService.updateMaintenance(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Maintenance updated successfully', mnt);
});

const updateMaintenanceStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  const mnt = await maintenanceService.updateMaintenanceStatus(req.params.id, status, notes, req.user.id);
  sendSuccess(res, 200, 'Maintenance status updated successfully', mnt);
});

const deleteMaintenance = catchAsync(async (req, res) => {
  await maintenanceService.deleteMaintenance(req.params.id);
  sendSuccess(res, 200, 'Maintenance record deleted successfully');
});

// Legacy routes wrappers
const getMaintenanceLogs = getMaintenance;
const getMaintenanceLogById = getMaintenanceById;
const createMaintenanceLog = createMaintenance;
const updateMaintenanceLog = updateMaintenance;
const deleteMaintenanceLog = deleteMaintenance;

const closeMaintenance = catchAsync(async (req, res) => {
  const mnt = await maintenanceService.updateMaintenanceStatus(req.params.id, 'COMPLETED', 'Maintenance closed via legacy route', req.user.id);
  sendSuccess(res, 200, 'Maintenance closed successfully', mnt);
});

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  getMaintenanceByVehicleId,
  getUpcoming,
  getOverdue,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  
  // Legacy exports
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  closeMaintenance,
};
