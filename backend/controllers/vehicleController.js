/**
 * vehicleController.js - Vehicle controller for TransitOps.
 *
 * Handles incoming HTTP requests for vehicle management, delegating
 * business logic to the vehicle.service.
 *
 * All functions are wrapped in catchAsync to handle promise rejections.
 */
const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/vehicles
 * Retrieve a list of active vehicles. Supports query filtering.
 */
const getVehicles = catchAsync(async (req, res) => {
  const vehicles = await vehicleService.getAllVehicles(req.query);
  sendSuccess(res, 200, 'Vehicles retrieved successfully', vehicles);
});

/**
 * GET /api/v1/vehicles/:id
 * Retrieve a single active vehicle by its ID.
 */
const getVehicleById = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  sendSuccess(res, 200, 'Vehicle retrieved successfully', vehicle);
});

/**
 * POST /api/v1/vehicles
 * Create a new vehicle.
 */
const createVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  sendSuccess(res, 201, 'Vehicle created successfully', vehicle);
});

/**
 * PUT /api/v1/vehicles/:id
 * Update an existing vehicle by ID.
 */
const updateVehicle = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  sendSuccess(res, 200, 'Vehicle updated successfully', vehicle);
});

/**
 * DELETE /api/v1/vehicles/:id
 * Soft-delete a vehicle (mark as inactive and retired).
 */
const deleteVehicle = catchAsync(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  sendSuccess(res, 200, 'Vehicle deleted successfully');
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
