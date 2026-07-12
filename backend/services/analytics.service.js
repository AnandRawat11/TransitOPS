/**
 * analytics.service.js
 * Centralized KPI Engine using MongoDB Aggregation Pipelines.
 */
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

/**
 * FLEET KPIs
 */
exports.getFleetKPIs = async () => {
  const pipeline = [
    {
      $facet: {
        totalVehicles: [{ $count: "count" }],
        activeVehicles: [{ $match: { isActive: true } }, { $count: "count" }],
        statusCounts: [{ $match: { isActive: true } }, { $group: { _id: "$status", count: { $sum: 1 } } }],
        avgAge: [{ $group: { _id: null, avgYear: { $avg: "$year" } } }]
      }
    }
  ];
  const result = await Vehicle.aggregate(pipeline);
  const data = result[0];

  const total = data.totalVehicles[0]?.count || 0;
  const active = data.activeVehicles[0]?.count || 0;
  
  const statuses = data.statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, { AVAILABLE: 0, ON_TRIP: 0, MAINTENANCE: 0, OUT_OF_SERVICE: 0 });

  const utilization = active > 0 ? ((statuses.ON_TRIP / active) * 100).toFixed(2) : 0;
  const availability = active > 0 ? (((statuses.AVAILABLE + statuses.ON_TRIP) / active) * 100).toFixed(2) : 0;
  const downtime = active > 0 ? ((statuses.MAINTENANCE / active) * 100).toFixed(2) : 0;
  const currentYear = new Date().getFullYear();
  const averageAge = data.avgAge[0] ? (currentYear - data.avgAge[0].avgYear).toFixed(1) : 0;

  return { total, active, statuses, utilization, availability, downtime, averageAge };
};

/**
 * TRIP KPIs
 */
exports.getTripKPIs = async () => {
  const pipeline = [
    {
      $facet: {
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        averages: [{ $match: { status: "COMPLETED" } }, { $group: { _id: null, avgDistance: { $avg: "$distance" }, avgCost: { $avg: "$estimatedCost" } } }]
      }
    }
  ];
  const result = await Trip.aggregate(pipeline);
  const data = result[0];

  const statuses = data.statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, { SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 });

  const total = Object.values(statuses).reduce((a, b) => a + b, 0);
  const successRate = total > 0 ? ((statuses.COMPLETED / total) * 100).toFixed(2) : 0;

  return {
    total,
    statuses,
    successRate,
    avgDistance: data.averages[0]?.avgDistance?.toFixed(2) || 0,
    avgCost: data.averages[0]?.avgCost?.toFixed(2) || 0,
  };
};

/**
 * FINANCIAL KPIs
 */
exports.getFinancialKPIs = async () => {
  const pipeline = [
    { $match: { approvalStatus: 'APPROVED' } },
    {
      $facet: {
        totalExpense: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
        categoryBreakdown: [{ $group: { _id: "$expenseCategory", total: { $sum: "$amount" } } }],
        monthlyTrend: [
          {
            $group: {
              _id: {
                year: { $year: "$expenseDate" },
                month: { $month: "$expenseDate" }
              },
              total: { $sum: "$amount" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]
      }
    }
  ];
  
  const result = await Expense.aggregate(pipeline);
  const data = result[0];
  
  const totalOperatingCost = data.totalExpense[0]?.total || 0;
  
  const categoryBreakdown = data.categoryBreakdown.map(c => ({
    category: c._id,
    amount: c.total
  }));

  const monthlyTrend = data.monthlyTrend.map(m => ({
    month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
    total: m.total
  }));

  return { totalOperatingCost, categoryBreakdown, monthlyTrend };
};

/**
 * MAINTENANCE KPIs
 */
exports.getMaintenanceKPIs = async () => {
  const pipeline = [
    {
      $facet: {
        totals: [{ $group: { _id: null, totalCost: { $sum: "$cost" } } }],
        types: [{ $group: { _id: "$maintenanceType", count: { $sum: 1 } } }],
        statuses: [{ $group: { _id: "$status", count: { $sum: 1 } } }]
      }
    }
  ];
  const result = await Maintenance.aggregate(pipeline);
  const data = result[0];

  const totalCost = data.totals[0]?.totalCost || 0;
  const types = data.types.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {});
  
  const prevCount = types['PREVENTIVE'] || 0;
  const corrCount = (types['CORRECTIVE'] || 0) + (types['EMERGENCY'] || 0);
  const totalMaint = prevCount + corrCount;
  
  const prevRatio = totalMaint > 0 ? ((prevCount / totalMaint) * 100).toFixed(1) : 0;

  return { totalCost, prevCount, corrCount, prevRatio };
};

/**
 * FUEL KPIs
 */
exports.getFuelKPIs = async () => {
  const pipeline = [
    {
      $facet: {
        totals: [{ $group: { _id: null, totalQuantity: { $sum: "$quantity" }, totalCost: { $sum: "$totalCost" } } }]
      }
    }
  ];
  const result = await FuelLog.aggregate(pipeline);
  const data = result[0];
  
  return {
    totalFuel: data.totals[0]?.totalQuantity || 0,
    totalFuelCost: data.totals[0]?.totalCost || 0
  };
};

/**
 * DRIVER KPIs
 */
exports.getDriverKPIs = async () => {
  const drivers = await User.countDocuments({ role: 'DRIVER', isActive: true });
  return { totalActiveDrivers: drivers };
};

/**
 * DASHBOARD OVERVIEW (Combine all)
 */
exports.getExecutiveDashboard = async () => {
  const [fleet, trips, finance, maintenance, fuel, drivers] = await Promise.all([
    this.getFleetKPIs(),
    this.getTripKPIs(),
    this.getFinancialKPIs(),
    this.getMaintenanceKPIs(),
    this.getFuelKPIs(),
    this.getDriverKPIs()
  ]);

  return { fleet, trips, finance, maintenance, fuel, drivers };
};
