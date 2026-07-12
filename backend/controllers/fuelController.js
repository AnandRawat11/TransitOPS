/**
 * fuelController.js - Fuel endpoints controller.
 */
const fuelService = require('../services/fuel.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const createFuelLog = catchAsync(async (req, res) => {
  const log = await fuelService.createFuelLog(req.body, req.user.id);
  sendSuccess(res, 201, 'Fuel log created successfully', log);
});

const getFuelLogs = catchAsync(async (req, res) => {
  const result = await fuelService.getAllFuelLogs(req.query);
  res.status(200).json({
    success: true,
    message: 'Fuel logs retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});

const getFuelLogById = catchAsync(async (req, res) => {
  const log = await fuelService.getFuelLogById(req.params.id);
  sendSuccess(res, 200, 'Fuel log retrieved successfully', log);
});

const updateFuelLog = catchAsync(async (req, res) => {
  const log = await fuelService.updateFuelLog(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Fuel log updated successfully', log);
});

const deleteFuelLog = catchAsync(async (req, res) => {
  await fuelService.deleteFuelLog(req.params.id);
  sendSuccess(res, 200, 'Fuel log deleted successfully');
});

module.exports = {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
};
