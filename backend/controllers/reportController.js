const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const Trip = require('../models/Trip');

// Helper to get general stats
const getReportsData = async () => {
  const vehicles = await Vehicle.find({ currentStatus: { $ne: 'RETIRED' }, isActive: true });

  // 1. Fuel cost and liters
  const fuelAgg = await FuelLog.aggregate([
    {
      $group: {
        _id: '$vehicle',
        totalFuelCost: { $sum: '$cost' },
        totalFuelLiters: { $sum: '$liters' },
      },
    },
  ]);

  // 2. Maintenance cost
  const maintenanceAgg = await Maintenance.aggregate([
    {
      $group: {
        _id: '$vehicleId',
        totalMaintenanceCost: { $sum: '$actualCost' },
      },
    },
  ]);

  // 3. Trip distance and revenue
  const tripAgg = await Trip.aggregate([
    { $match: { tripStatus: 'COMPLETED' } },
    {
      $group: {
        _id: '$vehicleId',
        totalDistance: { $sum: '$actualDistance' },
        totalRevenue: { $sum: '$revenue' },
      },
    },
  ]);

  // Build maps for efficient O(1) lookup
  const fuelMap = {};
  fuelAgg.forEach((item) => {
    if (item._id) {
      fuelMap[item._id.toString()] = item;
    }
  });

  const maintenanceMap = {};
  maintenanceAgg.forEach((item) => {
    if (item._id) {
      maintenanceMap[item._id.toString()] = item.totalMaintenanceCost;
    }
  });

  const tripMap = {};
  tripAgg.forEach((item) => {
    if (item._id) {
      tripMap[item._id.toString()] = item;
    }
  });

  return {
    vehicles,
    fuelMap,
    maintenanceMap,
    tripMap,
  };
};

// @desc    Get operational costs report per vehicle
// @route   GET /api/reports/operational-cost
// @access  Private
const getOperationalCost = async (req, res, next) => {
  try {
    const { vehicles, fuelMap, maintenanceMap } = await getReportsData();

    const data = vehicles.map((v) => {
      const vId = v._id.toString();
      const fuelCost = fuelMap[vId]?.totalFuelCost || 0;
      const maintenanceCost = maintenanceMap[vId] || 0;

      return {
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        name: v.vehicleName,
        fuelCost,
        maintenanceCost,
        totalCost: fuelCost + maintenanceCost,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fuel efficiency report per vehicle
// @route   GET /api/reports/fuel-efficiency
// @access  Private
const getFuelEfficiency = async (req, res, next) => {
  try {
    const { vehicles, fuelMap, tripMap } = await getReportsData();

    const data = vehicles.map((v) => {
      const vId = v._id.toString();
      const totalDistance = tripMap[vId]?.totalDistance || 0;
      const totalLiters = fuelMap[vId]?.totalFuelLiters || 0;
      const efficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;

      return {
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        name: v.vehicleName,
        totalDistance,
        totalLiters,
        efficiency: parseFloat(efficiency.toFixed(2)),
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fleet utilization
// @route   GET /api/reports/fleet-utilization
// @access  Private
const getFleetUtilization = async (req, res, next) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ currentStatus: { $ne: 'RETIRED' }, isActive: true });
    const activeVehicles = await Vehicle.countDocuments({ currentStatus: 'ON_TRIP', isActive: true });
    const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle ROI report
// @route   GET /api/reports/roi
// @access  Private
const getVehicleROI = async (req, res, next) => {
  try {
    const { vehicles, fuelMap, maintenanceMap, tripMap } = await getReportsData();

    const data = vehicles.map((v) => {
      const vId = v._id.toString();
      const revenue = tripMap[vId]?.totalRevenue || 0;
      const fuelCost = fuelMap[vId]?.totalFuelCost || 0;
      const maintenanceCost = maintenanceMap[vId] || 0;
      const acquisitionCost = v.acquisitionCost || 0;
      const netProfit = revenue - (fuelCost + maintenanceCost);

      let roi = 0;
      if (acquisitionCost > 0) {
        roi = (netProfit / acquisitionCost) * 100;
      }

      return {
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        name: v.vehicleName,
        acquisitionCost,
        revenue,
        fuelCost,
        maintenanceCost,
        netProfit,
        roi: acquisitionCost > 0 ? parseFloat(roi.toFixed(2)) : 0,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export combined reports to CSV
// @route   GET /api/reports/export/csv
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const { vehicles, fuelMap, maintenanceMap, tripMap } = await getReportsData();

    // Headers
    const headers = [
      'Registration Number',
      'Name',
      'Acquisition Cost ($)',
      'Total Fuel Cost ($)',
      'Total Fuel Liters (L)',
      'Total Maintenance Cost ($)',
      'Total Distance (km)',
      'Total Revenue ($)',
      'Fuel Efficiency (km/L)',
      'Net Profit ($)',
      'ROI (%)',
    ];

    const rows = vehicles.map((v) => {
      const vId = v._id.toString();
      const acquisitionCost = v.acquisitionCost || 0;
      const fuelCost = fuelMap[vId]?.totalFuelCost || 0;
      const fuelLiters = fuelMap[vId]?.totalFuelLiters || 0;
      const maintenanceCost = maintenanceMap[vId] || 0;
      const distance = tripMap[vId]?.totalDistance || 0;
      const revenue = tripMap[vId]?.totalRevenue || 0;
      const efficiency = fuelLiters > 0 ? distance / fuelLiters : 0;
      const netProfit = revenue - (fuelCost + maintenanceCost);
      const roi = acquisitionCost > 0 ? ((netProfit / acquisitionCost) * 100).toFixed(2) : '0.00';

      return [
        v.registrationNumber,
        v.vehicleName,
        acquisitionCost,
        fuelCost,
        fuelLiters,
        maintenanceCost,
        distance,
        revenue,
        efficiency.toFixed(2),
        netProfit,
        roi,
      ];
    });

    // Generate CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops-fleet-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOperationalCost,
  getFuelEfficiency,
  getFleetUtilization,
  getVehicleROI,
  exportCSV,
};
