/**
 * trip.service.js - Core business logic for Trips Module.
 */
const Trip = require('../models/Trip');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const vehicleService = require('./vehicle.service');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');

// Generates TRP-YYYYMMDD-XXXX
const generateTripNumber = async () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  // Using countDocuments isn't perfectly race-condition safe for high throughput,
  // but it's sufficient for this ERP scale. A sequence collection is better for massive scale.
  const count = await Trip.countDocuments({ tripNumber: new RegExp(`^TRP-${date}`) });
  const seq = String(count + 1).padStart(4, '0');
  return `TRP-${date}-${seq}`;
};

/**
 * Validates driver assignment (driver exists, is active, is a DRIVER, and has no active trips).
 */
const validateDriverAvailability = async (driverId, excludeTripId = null) => {
  if (!driverId) return;

  const driver = await Driver.findById(driverId);
  if (!driver) throw new AppError('Assigned driver not found', 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (driver.status !== 'Available') {
    throw new AppError(`Assigned driver status is not Available (currently ${driver.status})`, 400);
  }
  if (driver.licenseExpiryDate && driver.licenseExpiryDate < today) {
    throw new AppError('Assigned driver license has expired', 400);
  }
  if (driver.status === 'Suspended') {
    throw new AppError('Assigned driver is suspended', 400);
  }

  // Check if driver has an active trip
  const activeTripQuery = {
    driverId,
    tripStatus: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
  };
  if (excludeTripId) activeTripQuery._id = { $ne: excludeTripId };

  const activeTrip = await Trip.findOne(activeTripQuery);
  if (activeTrip) {
    throw new AppError(`Driver is currently assigned to active trip ${activeTrip.tripNumber}`, 400);
  }
};

/**
 * Validates vehicle assignment (vehicle exists, is active, is AVAILABLE, and capacity).
 */
const validateVehicleAvailability = async (vehicleId, cargoWeight) => {
  if (!vehicleId) return;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new AppError('Assigned vehicle not found', 404);
  if (!vehicle.isActive) throw new AppError('Assigned vehicle is not active', 400);
  if (vehicle.currentStatus !== 'AVAILABLE') throw new AppError(`Assigned vehicle is not AVAILABLE (currently ${vehicle.currentStatus})`, 400);
  
  if (vehicle.maxLoad && cargoWeight > vehicle.maxLoad) {
    throw new AppError(`Cargo weight (${cargoWeight}) exceeds vehicle maximum load (${vehicle.maxLoad})`, 400);
  }
};

const createTrip = async (data, creatorId) => {
  // Generate trip number if not provided (overrides allowed for admins handled in controller ideally, but here we just check if it exists)
  if (!data.tripNumber) {
    data.tripNumber = await generateTripNumber();
  } else {
    const existing = await Trip.findOne({ tripNumber: data.tripNumber });
    if (existing) throw new AppError(`Trip number ${data.tripNumber} already exists`, 409);
  }

  // Initial status logic
  let initialStatus = 'PLANNED';
  if (data.vehicleId || data.driverId) {
    initialStatus = 'ASSIGNED';
  }

  // Validate assignments
  if (data.vehicleId) await validateVehicleAvailability(data.vehicleId, data.cargoWeight);
  if (data.driverId) await validateDriverAvailability(data.driverId);

  const tripData = {
    ...data,
    tripStatus: initialStatus,
    statusHistory: [{ status: initialStatus, notes: 'Trip created' }],
    createdBy: creatorId
  };

  const trip = await Trip.create(tripData);

  // Note: We don't change vehicle status to ON_TRIP until the trip is IN_PROGRESS
  return trip;
};

const getAllTrips = async (query) => {
  const filter = {};

  if (query.status) filter.tripStatus = query.status;
  if (query.region) filter.region = query.region;
  if (query.priority) filter.priority = query.priority;
  if (query.driverId) filter.driverId = query.driverId;
  if (query.vehicleId) filter.vehicleId = query.vehicleId;

  // Search
  if (query.search) {
    filter.tripNumber = new RegExp(query.search, 'i');
  }

  // Date range
  if (query.startDate && query.endDate) {
    filter.plannedStartTime = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate),
    };
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  let sort = { createdAt: -1 };
  if (query.sortBy) {
    sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }

  const [data, total] = await Promise.all([
    Trip.find(filter)
      .populate('vehicleId', 'registrationNumber vehicleName currentStatus region')
      .populate('driverId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Trip.countDocuments(filter),
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

const getTripById = async (id) => {
  const trip = await Trip.findById(id)
    .populate('vehicleId', 'registrationNumber vehicleName currentStatus region maxLoad odometer')
    .populate('driverId', 'name email phone')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!trip) throw new AppError('Trip not found', 404);
  return trip;
};

const updateTrip = async (id, data, updaterId) => {
  const trip = await Trip.findById(id);
  if (!trip) throw new AppError('Trip not found', 404);

  // Prevent status updates via this generic update
  if (data.tripStatus) delete data.tripStatus;

  // If driver is being changed, validate new driver
  if (data.driverId && data.driverId !== trip.driverId?.toString()) {
    await validateDriverAvailability(data.driverId, id);
  }

  // If vehicle is being changed, validate new vehicle
  if (data.vehicleId && data.vehicleId !== trip.vehicleId?.toString()) {
    const weightToCheck = data.cargoWeight || trip.cargoWeight;
    await validateVehicleAvailability(data.vehicleId, weightToCheck);
  }

  const updatedTrip = await Trip.findByIdAndUpdate(
    id,
    { ...data, updatedBy: updaterId },
    { new: true, runValidators: true }
  ).populate('vehicleId').populate('driverId');

  return updatedTrip;
};

const updateTripStatus = async (id, newStatus, notes, updaterId) => {
  const trip = await Trip.findById(id);
  if (!trip) throw new AppError('Trip not found', 404);

  const currentStatus = trip.tripStatus;

  // Strict transitions
  const validTransitions = {
    PLANNED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_PROGRESS', 'PLANNED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  // Assignment Validation for moving out of PLANNED
  if (newStatus === 'ASSIGNED' || newStatus === 'IN_PROGRESS') {
    if (!trip.vehicleId || !trip.driverId) {
      throw new AppError(`Trip must have a vehicle and driver assigned to transition to ${newStatus}`, 400);
    }
  }

  trip.tripStatus = newStatus;
  trip.statusHistory.push({ status: newStatus, notes, changedAt: new Date() });
  trip.updatedBy = updaterId;

  // Lifecycle Sync actions
  if (newStatus === 'IN_PROGRESS') {
    trip.actualStartTime = new Date();
    if (trip.vehicleId) {
      await vehicleService.updateVehicleStatus(trip.vehicleId, 'ON_TRIP');
    }
    if (trip.driverId) {
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'On Trip' });
    }
  }

  if (newStatus === 'COMPLETED') {
    trip.completedAt = new Date();
    trip.actualEndTime = new Date();
    if (trip.vehicleId) {
      // Return vehicle to AVAILABLE
      await vehicleService.updateVehicleStatus(trip.vehicleId, 'AVAILABLE');
      // If trip provided an endOdometer, update vehicle's odometer
      if (trip.endOdometer) {
        await vehicleService.updateVehicle(trip.vehicleId, { odometer: trip.endOdometer });
      }
    }
    if (trip.driverId) {
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'Available' });
    }
  }

  if (newStatus === 'CANCELLED') {
    trip.cancelledAt = new Date();
    if (currentStatus === 'IN_PROGRESS') {
      if (trip.vehicleId) {
        await vehicleService.updateVehicleStatus(trip.vehicleId, 'AVAILABLE');
      }
      if (trip.driverId) {
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'Available' });
      }
    }
  }

  await trip.save();
  return trip;
};

const deleteTrip = async (id) => {
  const trip = await Trip.findById(id);
  if (!trip) throw new AppError('Trip not found', 404);

  // We can choose soft delete or hard delete. Since we have a strict lifecycle,
  // we'll prevent deleting active trips.
  if (['ASSIGNED', 'IN_PROGRESS'].includes(trip.tripStatus)) {
    throw new AppError('Cannot delete an active trip. Cancel it first.', 400);
  }

  await Trip.findByIdAndDelete(id);
};

// Dashboard Services
const getDashboardSummary = async () => {
  const stats = await Trip.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $in: ['$tripStatus', ['ASSIGNED', 'IN_PROGRESS']] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$tripStatus', 'COMPLETED'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$tripStatus', 'CANCELLED'] }, 1, 0] } },
        delayed: { $sum: { $cond: [{ $ifNull: ['$delayReason', false] }, 1, 0] } },
        // Avg duration for completed trips (in milliseconds)
        avgDurationMs: { 
          $avg: {
            $cond: [
              { $eq: ['$tripStatus', 'COMPLETED'] },
              { $subtract: ['$actualEndTime', '$actualStartTime'] },
              null
            ]
          }
        }
      }
    }
  ]);

  if (stats.length === 0) return { total: 0, active: 0, completed: 0, cancelled: 0, delayed: 0, avgDurationHours: 0, fleetUtilization: 0 };

  const summary = stats[0];
  delete summary._id;
  
  // Convert ms to hours
  summary.avgDurationHours = summary.avgDurationMs ? Math.round(summary.avgDurationMs / (1000 * 60 * 60) * 10) / 10 : 0;
  delete summary.avgDurationMs;

  // Quick fleet utilization (Active Trips / Total Vehicles)
  const totalVehicles = await Vehicle.countDocuments({ isActive: true });
  summary.fleetUtilization = totalVehicles > 0 ? Math.round((summary.active / totalVehicles) * 100) : 0;

  return summary;
};

const getDashboardAnalytics = async () => {
  const analytics = await Trip.aggregate([
    {
      $facet: {
        tripsByStatus: [
          { $group: { _id: '$tripStatus', count: { $sum: 1 } } }
        ],
        averages: [
          { $match: { tripStatus: 'COMPLETED' } },
          { 
            $group: { 
              _id: null, 
              avgDistance: { $avg: '$actualDistance' },
              avgFuel: { $avg: '$actualFuel' }
            } 
          }
        ],
        // Trips per month (last 12 months)
        monthlyTrends: [
          {
            $group: {
              _id: {
                year: { $year: '$plannedStartTime' },
                month: { $month: '$plannedStartTime' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);

  const rawAverages = analytics[0].averages[0] || { avgDistance: 0, avgFuel: 0 };
  
  // Format monthly trends
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedTrends = analytics[0].monthlyTrends.map(t => ({
    name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    trips: t.count
  }));

  return {
    tripsByStatus: analytics[0].tripsByStatus.map(t => ({ name: t._id, value: t.count })),
    avgDistance: Math.round(rawAverages.avgDistance || 0),
    avgFuel: Math.round(rawAverages.avgFuel || 0),
    monthlyTrends: formattedTrends
  };
};

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  updateTripStatus,
  deleteTrip,
  getDashboardSummary,
  getDashboardAnalytics
};
