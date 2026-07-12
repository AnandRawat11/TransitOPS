const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { vehicleId, type } = req.query;
    let query = {};
    
    if (vehicleId) {
      query.vehicle = vehicleId;
    }
    if (type) {
      query.type = type;
    }

    const expenses = await Expense.find(query)
      .populate('vehicle')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('vehicle');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private (FleetManager / FinancialAnalyst)
const createExpense = async (req, res, next) => {
  try {
    const { vehicle, type, amount, date, notes } = req.body;

    if (!vehicle || !type || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle, type, amount, and date.',
      });
    }

    // Verify vehicle exists
    const vehicleExists = await Vehicle.findById(vehicle);
    if (!vehicleExists) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    const newExpense = await Expense.create({
      vehicle,
      type,
      amount,
      date,
      notes,
    });

    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('vehicle');

    res.status(201).json({
      success: true,
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense entry
// @route   DELETE /api/expenses/:id
// @access  Private (FleetManager only)
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found',
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense entry removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
