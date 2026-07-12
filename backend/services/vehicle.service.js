/**
 * vehicle.service.js - Vehicle business logic for TransitOps.
 *
 * Encapsulates vehicle CRUD operations, filtering, status management,
 * and analytics. Controllers delegate to this service and handle HTTP concerns only.
 */
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Get a paginated list of vehicles with robust filtering.
 *
 * @param {object} query - Query parameters (status, region, type, page, limit, search)
 * @returns {Promise<object>} { data, pagination }
 */
const getAllVehicles = async (query) => {
  // Base filter: active or inactive? Default to active if not specified.
  const filter = {};
  filter.isActive = query.isActive !== undefined ? query.isActive === 'true' : true;

  // Apply optional filters from query string
  if (query.status) filter.currentStatus = query.status;
  if (query.region) filter.region = query.region;
  if (query.type) filter.vehicleType = query.type;
  if (query.fuel) filter.fuelType = query.fuel;

  // Robust Search (case-insensitive regex)
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { registrationNumber: searchRegex },
      { vehicleName: searchRegex },
      { manufacturer: searchRegex },
      { model: searchRegex },
    ];
  }

  // Pagination setup
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute query with pagination and sort by newest
  const [data, total] = await Promise.all([
    Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Vehicle.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get available vehicles specifically for Trips module.
 *
 * @param {object} query - Filters like region, type, minLoad
 * @returns {Promise<Array<object>>} Sorted by lowest odometer
 */
const getAvailableVehicles = async (query) => {
  const filter = {
    isActive: true,
    currentStatus: 'AVAILABLE',
  };

  if (query.region) filter.region = query.region;
  if (query.type) filter.vehicleType = query.type;
  if (query.minLoad) filter.maxLoad = { $gte: parseInt(query.minLoad, 10) };

  // Sort by lowest odometer as a proxy for "least used"
  return await Vehicle.find(filter).sort({ odometer: 1 });
};

/**
 * Get a single vehicle by ID.
 *
 * @param {string} id - Vehicle MongoDB ObjectId
 * @returns {Promise<object>} Vehicle document
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
 */
const createVehicle = async (data) => {
  // Check for duplicate registration number
  const existing = await Vehicle.findOne({ registrationNumber: data.registrationNumber });
  if (existing) {
    throw new AppError(`Vehicle with registration number ${data.registrationNumber} already exists`, 409);
  }

  // Initial status history entry
  const vehicleData = {
    ...data,
    statusHistory: [{ status: data.currentStatus || 'AVAILABLE' }]
  };

  return await Vehicle.create(vehicleData);
};

/**
 * Update an existing vehicle.
 *
 * @param {string} id - Vehicle MongoDB ObjectId
 * @param {object} data - Data to update (partial update supported)
 * @returns {Promise<object>} The updated vehicle document
 */
const updateVehicle = async (id, data) => {
  // Prevent updating registrationNumber to an existing one
  if (data.registrationNumber) {
    const existing = await Vehicle.findOne({
      registrationNumber: data.registrationNumber,
      _id: { $ne: id },
    });

    if (existing) {
      throw new AppError(`Registration number ${data.registrationNumber} is already used`, 409);
    }
  }

  // Prevent status updates through this route - use the dedicated status API
  if (data.currentStatus) {
    delete data.currentStatus;
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, isActive: true },
    data,
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }

  return vehicle;
};

/**
 * Update vehicle status with strict transition validation.
 *
 * @param {string} id - Vehicle ID
 * @param {string} newStatus - The new status
 * @returns {Promise<object>}
 */
const updateVehicleStatus = async (id, newStatus) => {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true });
  
  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }

  const currentStatus = vehicle.currentStatus;

  // Define valid transitions
  const validTransitions = {
    AVAILABLE: ['ON_TRIP', 'MAINTENANCE', 'RETIRED'],
    ON_TRIP: ['AVAILABLE'],
    MAINTENANCE: ['AVAILABLE'],
    RETIRED: [], // Terminal state
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  // Update status and push to history
  vehicle.currentStatus = newStatus;
  vehicle.statusHistory.push({ status: newStatus });
  
  await vehicle.save();
  return vehicle;
};

/**
 * Soft-delete a vehicle.
 */
const deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findOne({ _id: id, isActive: true });
  
  if (!vehicle) {
    throw new AppError(`Vehicle not found with id: ${id}`, 404);
  }

  vehicle.isActive = false;
  vehicle.currentStatus = 'RETIRED';
  vehicle.statusHistory.push({ status: 'RETIRED' });
  
  await vehicle.save();
};

/**
 * Get Fleet Dashboard Summary KPIs
 */
const getFleetSummary = async () => {
  const stats = await Vehicle.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: { $sum: { $cond: [{ $eq: ['$currentStatus', 'AVAILABLE'] }, 1, 0] } },
        onTrip: { $sum: { $cond: [{ $eq: ['$currentStatus', 'ON_TRIP'] }, 1, 0] } },
        maintenance: { $sum: { $cond: [{ $eq: ['$currentStatus', 'MAINTENANCE'] }, 1, 0] } },
      }
    }
  ]);

  if (stats.length === 0) return { total: 0, available: 0, onTrip: 0, maintenance: 0, utilization: 0 };

  const summary = stats[0];
  delete summary._id;
  
  // Basic Utilization %: (On Trip / Total Active) * 100
  summary.utilization = summary.total > 0 ? Math.round((summary.onTrip / summary.total) * 100) : 0;

  return summary;
};

/**
 * Get Fleet Analytics (Distributions)
 */
const getFleetAnalytics = async () => {
  const analytics = await Vehicle.aggregate([
    { $match: { isActive: true } },
    {
      $facet: {
        typeDistribution: [
          { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
        ],
        regionDistribution: [
          { $group: { _id: '$region', count: { $sum: 1 } } }
        ],
        averages: [
          { 
            $group: { 
              _id: null, 
              avgOdometer: { $avg: '$odometer' },
              // Year difference is a rough proxy for age
              avgYear: { $avg: '$year' }
            } 
          }
        ]
      }
    }
  ]);

  const currentYear = new Date().getFullYear();
  const rawAverages = analytics[0].averages[0] || { avgOdometer: 0, avgYear: currentYear };

  return {
    typeDistribution: analytics[0].typeDistribution.map(t => ({ name: t._id, value: t.count })),
    regionDistribution: analytics[0].regionDistribution.filter(r => r._id).map(r => ({ name: r._id, value: r.count })),
    avgOdometer: Math.round(rawAverages.avgOdometer),
    avgAge: Math.round(currentYear - rawAverages.avgYear)
  };
};

module.exports = {
  getAllVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
  getFleetSummary,
  getFleetAnalytics
};
