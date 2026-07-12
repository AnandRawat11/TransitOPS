const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const Trip = require('../models/Trip');

const getReports = async (req, res, next) => {
  try {
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalFuelCost = await FuelLog.aggregate([
      { $group: { _id: null, total: { $sum: "$cost" } } }
    ]);

    const activeTripsCount = await Trip.countDocuments({ status: 'Active' });
    const completedTripsCount = await Trip.countDocuments({ status: 'Completed' });

    res.status(200).json({ 
      success: true, 
      data: {
        totalExpenses: totalExpenses[0]?.total || 0,
        totalFuelCost: totalFuelCost[0]?.total || 0,
        activeTripsCount,
        completedTripsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
};
