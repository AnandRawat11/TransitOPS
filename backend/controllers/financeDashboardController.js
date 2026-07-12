/**
 * financeDashboardController.js - Aggregation APIs for Finance and Operations
 */
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const getFinanceSummary = catchAsync(async (req, res) => {
  // Total Operational Cost (Approved or Pending, but let's just do all for now or filter by APPROVED?)
  // The prompt asked for: Total Fuel Cost, Total Maintenance Cost, Total Operational Cost, Pending Approvals

  const [expenseStats, pendingApprovals, totalVehicles] = await Promise.all([
    Expense.aggregate([
      {
        $group: {
          _id: '$expenseCategory',
          total: { $sum: '$amount' }
        }
      }
    ]),
    Expense.countDocuments({ approvalStatus: 'PENDING' }),
    Vehicle.countDocuments({ isActive: true })
  ]);

  let totalFuelCost = 0;
  let totalMaintenanceCost = 0;
  let totalOperationalCost = 0;

  expenseStats.forEach(stat => {
    totalOperationalCost += stat.total;
    if (stat._id === 'FUEL') totalFuelCost += stat.total;
    if (stat._id === 'MAINTENANCE') totalMaintenanceCost += stat.total;
  });

  const averageCostPerVehicle = totalVehicles > 0 ? Math.round(totalOperationalCost / totalVehicles) : 0;

  sendSuccess(res, 200, 'Finance summary retrieved', {
    totalOperationalCost,
    totalFuelCost,
    totalMaintenanceCost,
    pendingApprovals,
    averageCostPerVehicle
  });
});

const getFinanceAnalytics = catchAsync(async (req, res) => {
  const analytics = await Expense.aggregate([
    {
      $facet: {
        byCategory: [
          { $group: { _id: '$expenseCategory', totalCost: { $sum: '$amount' } } }
        ],
        monthlyTrends: [
          {
            $group: {
              _id: {
                year: { $year: '$expenseDate' },
                month: { $month: '$expenseDate' }
              },
              cost: { $sum: '$amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ],
        byVehicle: [
          { $match: { vehicleId: { $ne: null } } },
          { $group: { _id: '$vehicleId', totalCost: { $sum: '$amount' } } },
          { $sort: { totalCost: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'vehicles',
              localField: '_id',
              foreignField: '_id',
              as: 'vehicle'
            }
          },
          { $unwind: '$vehicle' },
          {
            $project: {
              _id: 1,
              totalCost: 1,
              registrationNumber: '$vehicle.registrationNumber'
            }
          }
        ]
      }
    }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedTrends = analytics[0].monthlyTrends.map(t => ({
    name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    cost: Math.round(t.cost)
  }));

  const byCategory = analytics[0].byCategory.map(t => ({ name: t._id, value: Math.round(t.totalCost) }));
  
  const byVehicle = analytics[0].byVehicle.map(t => ({
    name: t.registrationNumber,
    cost: Math.round(t.totalCost)
  }));

  sendSuccess(res, 200, 'Finance analytics retrieved', {
    byCategory,
    monthlyTrends: formattedTrends,
    topExpensiveVehicles: byVehicle
  });
});

module.exports = {
  getFinanceSummary,
  getFinanceAnalytics
};
