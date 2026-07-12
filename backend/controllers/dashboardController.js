const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard/kpis
// @access  Private
const getKpis = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    // Build match queries based on filters
    const vehicleMatch = {};
    const tripMatch = {};
    const driverMatch = {};

    if (region) {
      vehicleMatch.region = region;
      // Assuming trips have origin/destination or region, but if not, we can ignore or match if available.
      // For drivers:
      driverMatch.region = region;
    }
    
    if (type) {
      vehicleMatch.type = type;
    }
    
    if (status) {
      vehicleMatch.status = status;
    }

    // Vehicle KPIs using aggregation
    const vehicleStats = await Vehicle.aggregate([
      { $match: vehicleMatch },
      {
        $group: {
          _id: null,
          activeVehicles: {
            $sum: { $cond: [{ $ne: ['$status', 'Retired'] }, 1, 0] }
          },
          availableVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
          },
          vehiclesInMaintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] }
          },
          vehiclesOnTrip: {
            $sum: { $cond: [{ $eq: ['$status', 'On Trip'] }, 1, 0] }
          }
        }
      }
    ]);

    const vStats = vehicleStats[0] || {
      activeVehicles: 0,
      availableVehicles: 0,
      vehiclesInMaintenance: 0,
      vehiclesOnTrip: 0,
    };

    // Trip KPIs
    const tripStats = await Trip.aggregate([
      { $match: tripMatch },
      {
        $group: {
          _id: null,
          activeTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          pendingTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          }
        }
      }
    ]);

    const tStats = tripStats[0] || {
      activeTrips: 0,
      pendingTrips: 0,
    };

    // Driver KPIs
    const driverStats = await Driver.aggregate([
      { $match: driverMatch },
      {
        $group: {
          _id: null,
          driversOnDuty: {
            $sum: { $cond: [{ $eq: ['$status', 'On Trip'] }, 1, 0] }
          }
        }
      }
    ]);

    const dStats = driverStats[0] || {
      driversOnDuty: 0,
    };

    // Calculate Fleet Utilization
    // (number of vehicles with status On Trip / number of non-retired vehicles) * 100
    let fleetUtilization = 0;
    if (vStats.activeVehicles > 0) {
      fleetUtilization = (vStats.vehiclesOnTrip / vStats.activeVehicles) * 100;
    }

    res.json({
      success: true,
      data: {
        activeVehicles: vStats.activeVehicles,
        availableVehicles: vStats.availableVehicles,
        vehiclesInMaintenance: vStats.vehiclesInMaintenance,
        activeTrips: tStats.activeTrips,
        pendingTrips: tStats.pendingTrips,
        driversOnDuty: dStats.driversOnDuty,
        fleetUtilization: parseFloat(fleetUtilization.toFixed(2)),
      }
    });

  } catch (error) {
    console.error('Error in getKpis:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving KPIs' });
  }
};

module.exports = {
  getKpis,
/**
 * dashboardController.js - Dashboard endpoints for TransitOps.
 */
const vehicleService = require('../services/vehicle.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/dashboard/summary
 * KPI summary metrics.
 */
const getSummary = catchAsync(async (req, res) => {
  const summary = await vehicleService.getFleetSummary();
  sendSuccess(res, 200, 'Fleet summary retrieved', summary);
});

/**
 * GET /api/v1/dashboard/analytics
 * Data for charts and distributions.
 */
const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await vehicleService.getFleetAnalytics();
  sendSuccess(res, 200, 'Fleet analytics retrieved', analytics);
});

module.exports = {
  getSummary,
  getAnalytics
};
