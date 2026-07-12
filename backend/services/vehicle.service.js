/**
 * vehicle.service.js - Vehicle business logic for TransitOps.
 *
 * Encapsulates vehicle CRUD operations, filtering, and status management.
 * Controllers delegate to this service and handle HTTP concerns only.
 */
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Get a list of vehicles with basic filtering (no pagination yet).
 *
 * @param {object} query - Query parameters (status, region, vehicleType, etc.)
 * @returns {Promise<Array<object>>} List of vehicle documents
 */
const getAllVehicles = async (query) => {
  // Base filter: only show active vehicles
  const filter = { isActive: true };

  // Apply optional filters from query string
  if (query.status) filter.currentStatus = query.status;
  if (query.region) filter.region = query.region;
  if (query.type) filter.vehicleType = query.type;
  if (query.fuel) filter.fuelType = query.fuel;

  // Search by registration number or name (case-insensitive regex)
  if (query.search) {
    filter.$or = [
      { registrationNumber: { $regex: query.search, $options: 'i' } },
      { vehicleName: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Find and sort by newest first
  return await Vehicle.find(filter).sort({ createdAt: -1 });
};

/**
 * Get a single vehicle by ID.
 *
 * @param {string} id - Vehicle MongoDB ObjectId
 * @returns {Promise<object>} Vehicle document
 * @throws {AppError} 404 if not found or inactive
 */
const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true });

  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }

  return vehicle;
};

/**
 * Create a new vehicle in the fleet.
 *
 * @param {object} data - Vehicle creation data
 * @returns {Promise<object>} The created vehicle document
 * @throws {AppError} 409 if registration number is already in use
 */
const createVehicle = async (data) => {
  // Check for duplicate registration number (across active and inactive)
  const existing = await Vehicle.findOne({ registrationNumber: data.registrationNumber });
  if (existing) {
    throw new AppError(`Vehicle with registration number ${data.registrationNumber} already exists`, 409);
  }

  return await Vehicle.create(data);
};

/**
 * Update an existing vehicle.
 *
 * @param {string} id - Vehicle MongoDB ObjectId
 * @param {object} data - Data to update (partial update supported)
 * @returns {Promise<object>} The updated vehicle document
 * @throws {AppError} 404 if not found or inactive
 */
const updateVehicle = async (id, data) => {
  // Prevent updating registrationNumber to an existing one
  if (data.registrationNumber) {
    const existing = await Vehicle.findOne({ 
      registrationNumber: data.registrationNumber,
      _id: { $ne: id } // Exclude the current vehicle
    });
    
    if (existing) {
      throw new AppError(`Registration number ${data.registrationNumber} is already used by another vehicle`, 409);
    }
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isActive: true },
    data,
    { new: true, runValidators: true } // Return updated doc, run model validations
  );

  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }

  return vehicle;
};

/**
 * Soft-delete a vehicle (sets isActive to false).
 *
 * @param {string} id - Vehicle MongoDB ObjectId
 * @returns {Promise<void>}
 * @throws {AppError} 404 if not found or already inactive
 */
const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false, currentStatus: 'RETIRED' }, // Also mark as retired
    { new: true }
  );

  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
