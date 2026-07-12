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
 * Retrieve a paginated list of vehicles. Supports query filtering and search.
 */
const getVehicles = catchAsync(async (req, res) => {
  const result = await vehicleService.getAllVehicles(req.query);
  // Send the data and pagination object directly
  res.status(200).json({
    success: true,
    message: 'Vehicles retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});

/**
 * GET /api/v1/vehicles/available
 * Retrieve all available vehicles sorted by lowest odometer.
 */
const getAvailableVehicles = catchAsync(async (req, res) => {
  const vehicles = await vehicleService.getAvailableVehicles(req.query);
  sendSuccess(res, 200, 'Available vehicles retrieved successfully', vehicles);
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
 * PATCH /api/v1/vehicles/:id/status
 * Update the status of a vehicle with state transitions.
 */
const updateVehicleStatus = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.updateVehicleStatus(req.params.id, req.body.status);
  sendSuccess(res, 200, 'Vehicle status updated successfully', vehicle);
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
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
};
