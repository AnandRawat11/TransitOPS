const Trip = require('../models/Trip');

const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().populate('vehicle').populate('driver');
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('vehicle').populate('driver');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.status(200).json({ success: true, data: trip });
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

const getTrips = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json({ success: true, data: trip });
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance } = req.body;

    // 1. Validate required fields
    if (!source || !destination || !vehicle || !driver || cargoWeight === undefined || plannedDistance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'source, destination, vehicle, driver, cargoWeight, and plannedDistance are required fields',
      });
    }

    // 2. Fetch vehicle and validate status
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }
    if (vehicleDoc.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available',
      });
    }

    // 3. Fetch driver and validate status & license
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }
    if (driverDoc.status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'Driver is suspended',
      });
    }
    if (driverDoc.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available',
      });
    }

    // Check if license is expired (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (driverDoc.licenseExpiryDate && new Date(driverDoc.licenseExpiryDate) < today) {
      return res.status(400).json({
        success: false,
        message: 'Driver license is expired',
      });
    }

    // 4. Validate cargo weight against vehicle capacity
    if (cargoWeight > vehicleDoc.maxLoadCapacity) {
      return res.status(400).json({
        success: false,
        message: `Cargo weight exceeds vehicle's maximum load capacity of ${vehicleDoc.maxLoadCapacity}`,
      });
    }

    // 5. Create Trip with status "Draft" and createdBy from req.user._id (or req.user.id)
    const createdBy = req.user ? (req.user._id || req.user.id) : null;
    const trip = await Trip.create({
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      status: 'Draft',
      createdBy,
    });

    res.status(201).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.status(200).json({ success: true, data: trip });
const dispatchTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find the Trip
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft trips can be dispatched',
      });
    }

    // 2. Fetch the assigned Vehicle
    const vehicleDoc = await Vehicle.findById(trip.vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle assigned to the trip not found',
      });
    }
    if (vehicleDoc.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available',
      });
    }

    // 3. Fetch the assigned Driver
    const driverDoc = await Driver.findById(trip.driver);
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        message: 'Driver assigned to the trip not found',
      });
    }
    if (driverDoc.status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'Driver is suspended',
      });
    }
    if (driverDoc.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available',
      });
    }

    // Check if license is expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (driverDoc.licenseExpiryDate && new Date(driverDoc.licenseExpiryDate) < today) {
      return res.status(400).json({
        success: false,
        message: 'Driver license is expired',
      });
    }

    // 4. Update Trip status and dispatchedAt
    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();

    // 5. Update Vehicle status
    vehicleDoc.status = 'On Trip';

    // 6. Update Driver status
    driverDoc.status = 'On Trip';

    // 7. Save all changes
    await trip.save();
    await vehicleDoc.save();
    await driverDoc.save();

    // 8. Return HTTP 200
    res.status(200).json({
      success: true,
      message: 'Trip dispatched successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const completeTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actualDistance, fuelConsumed } = req.body;

    // 1. Find the Trip
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({
        success: false,
        message: 'Only dispatched trips can be completed',
      });
    }

    // 2. & 3. Validate body fields
    if (actualDistance === undefined || actualDistance === null || actualDistance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'actualDistance is required and must be greater than 0',
      });
    }

    if (fuelConsumed === undefined || fuelConsumed === null || fuelConsumed < 0) {
      return res.status(400).json({
        success: false,
        message: 'fuelConsumed is required and must be greater than or equal to 0',
      });
    }

    // 4. Fetch the assigned Vehicle
    const vehicleDoc = await Vehicle.findById(trip.vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle assigned to the trip not found',
      });
    }

    // 5. Fetch the assigned Driver
    const driverDoc = await Driver.findById(trip.driver);
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        message: 'Driver assigned to the trip not found',
      });
    }

    // 6. Update Trip
    trip.status = 'Completed';
    trip.completedAt = new Date();
    trip.actualDistance = actualDistance;
    trip.fuelConsumed = fuelConsumed;

    // 7. Update Vehicle
    vehicleDoc.status = 'Available';
    vehicleDoc.odometer = (vehicleDoc.odometer || 0) + actualDistance;

    // 8. Update Driver
    driverDoc.status = 'Available';

    // 9. Save all changes
    await trip.save();
    await vehicleDoc.save();
    await driverDoc.save();

    // 10. Return HTTP 200
    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    res.status(200).json({ success: true, data: {} });
const cancelTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Find Trip
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    // 2. Allow cancellation only if status is "Draft" or "Dispatched"
    if (trip.status !== 'Draft' && trip.status !== 'Dispatched') {
      return res.status(400).json({
        success: false,
        message: 'Only Draft or Dispatched trips can be cancelled',
      });
    }

    // 3. & 4. Process cancellation
    if (trip.status === 'Dispatched') {
      const vehicleDoc = await Vehicle.findById(trip.vehicle);
      const driverDoc = await Driver.findById(trip.driver);

      if (vehicleDoc) {
        vehicleDoc.status = 'Available';
        await vehicleDoc.save();
      }
      if (driverDoc) {
        driverDoc.status = 'Available';
        await driverDoc.save();
      }
    }

    trip.status = 'Cancelled';
    await trip.save();

    // 5. Return HTTP 200
    res.status(200).json({
      success: true,
      message: 'Trip cancelled successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
