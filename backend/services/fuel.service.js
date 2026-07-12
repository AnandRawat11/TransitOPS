/**
 * fuel.service.js - Core business logic for Fuel tracking.
 */
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const expenseService = require('./expense.service');
const AppError = require('../utils/AppError');

const generateFuelLogNumber = async () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await FuelLog.countDocuments({ fuelLogNumber: new RegExp(`^FL-${date}`) });
  const seq = String(count + 1).padStart(4, '0');
  return `FL-${date}-${seq}`;
};

const createFuelLog = async (data, creatorId) => {
  if (!data.fuelLogNumber) {
    data.fuelLogNumber = await generateFuelLogNumber();
  }

  // 1. Verify Vehicle
  const vehicle = await Vehicle.findById(data.vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);

  // 2. Validate Odometer
  if (data.odometerReading <= (vehicle.odometer || 0)) {
    throw new AppError(`Odometer reading (${data.odometerReading}) must be greater than vehicle's last known odometer (${vehicle.odometer || 0})`, 400);
  }

  // 3. Verify Trip if provided
  if (data.tripId) {
    const trip = await Trip.findById(data.tripId);
    if (!trip) throw new AppError('Associated Trip not found', 404);
  }

  const fuelData = {
    ...data,
    createdBy: creatorId
  };

  const fuelLog = await FuelLog.create(fuelData);

  // 4. Update Vehicle Odometer
  vehicle.odometer = data.odometerReading;
  await vehicle.save();

  // 5. Automatically spawn a FUEL Expense record (Phase 5 decision)
  await expenseService.spawnAutoExpense({
    vehicleId: data.vehicleId,
    tripId: data.tripId || null,
    expenseCategory: 'FUEL',
    title: `Fuel Refill - ${data.fuelLogNumber}`,
    description: `Refilled ${data.quantity} units of ${data.fuelType} at ${data.fuelStation}`,
    amount: data.totalCost,
    vendor: data.fuelStation,
    invoiceNumber: data.invoiceNumber,
    paymentMethod: data.paymentMethod,
    expenseDate: data.filledAt || new Date(),
  }, creatorId);

  return fuelLog;
};

const getAllFuelLogs = async (query) => {
  const filter = {};

  if (query.vehicleId) filter.vehicleId = query.vehicleId;
  if (query.driverId) filter.driverId = query.driverId;
  if (query.tripId) filter.tripId = query.tripId;

  if (query.search) {
    filter.$or = [
      { fuelLogNumber: new RegExp(query.search, 'i') },
      { fuelStation: new RegExp(query.search, 'i') }
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let sort = { filledAt: -1 };
  if (query.sortBy) {
    sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }

  const [data, total] = await Promise.all([
    FuelLog.find(filter)
      .populate('vehicleId', 'registrationNumber vehicleName')
      .populate('driverId', 'name email')
      .populate('tripId', 'tripNumber')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FuelLog.countDocuments(filter),
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

const getFuelLogById = async (id) => {
  const log = await FuelLog.findById(id)
    .populate('vehicleId', 'registrationNumber vehicleName make model')
    .populate('driverId', 'name email phone')
    .populate('tripId', 'tripNumber')
    .populate('createdBy', 'name');

  if (!log) throw new AppError('Fuel log not found', 404);
  return log;
};

const updateFuelLog = async (id, data, updaterId) => {
  const log = await FuelLog.findById(id);
  if (!log) throw new AppError('Fuel log not found', 404);

  // Warning: Modifying fuel totalCost here does NOT automatically update the spawned Expense.
  // The system assumes the Expense ledger is the ultimate truth and must be updated separately if needed.
  // We allow minor updates to notes, locations, etc.

  const updatedLog = await FuelLog.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  ).populate('vehicleId').populate('driverId');

  return updatedLog;
};

const deleteFuelLog = async (id) => {
  const log = await FuelLog.findById(id);
  if (!log) throw new AppError('Fuel log not found', 404);

  // We do not auto-delete the expense here for audit reasons. The finance team must handle ledger deletions.
  await FuelLog.findByIdAndDelete(id);
};

module.exports = {
  createFuelLog,
  getAllFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
};
