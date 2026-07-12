/**
 * expense.service.js - Core business logic for generalized Expense tracking.
 */
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const AppError = require('../utils/AppError');

const generateExpenseNumber = async () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await Expense.countDocuments({ expenseNumber: new RegExp(`^EXP-${date}`) });
  const seq = String(count + 1).padStart(4, '0');
  return `EXP-${date}-${seq}`;
};

const createExpense = async (data, creatorId) => {
  if (!data.expenseNumber) {
    data.expenseNumber = await generateExpenseNumber();
  }

  // Basic validation for linked entities if provided
  if (data.vehicleId) {
    const v = await Vehicle.findById(data.vehicleId);
    if (!v) throw new AppError('Linked vehicle not found', 404);
  }
  if (data.tripId) {
    const t = await Trip.findById(data.tripId);
    if (!t) throw new AppError('Linked trip not found', 404);
  }

  const expenseData = {
    ...data,
    approvalStatus: 'PENDING',
    createdBy: creatorId
  };

  const expense = await Expense.create(expenseData);
  return expense;
};

const getAllExpenses = async (query) => {
  const filter = {};

  if (query.expenseCategory) filter.expenseCategory = query.expenseCategory;
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
  if (query.vehicleId) filter.vehicleId = query.vehicleId;
  if (query.tripId) filter.tripId = query.tripId;
  if (query.maintenanceId) filter.maintenanceId = query.maintenanceId;

  if (query.search) {
    filter.$or = [
      { expenseNumber: new RegExp(query.search, 'i') },
      { title: new RegExp(query.search, 'i') },
      { vendor: new RegExp(query.search, 'i') }
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let sort = { expenseDate: -1 };
  if (query.sortBy) {
    sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }

  const [data, total] = await Promise.all([
    Expense.find(filter)
      .populate('vehicleId', 'registrationNumber vehicleName')
      .populate('tripId', 'tripNumber')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
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

const getExpenseById = async (id) => {
  const expense = await Expense.findById(id)
    .populate('vehicleId', 'registrationNumber vehicleName')
    .populate('tripId', 'tripNumber')
    .populate('maintenanceId', 'maintenanceNumber')
    .populate('approvedBy', 'name email')
    .populate('createdBy', 'name');

  if (!expense) throw new AppError('Expense record not found', 404);
  return expense;
};

const updateExpense = async (id, data, updaterId) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new AppError('Expense record not found', 404);

  // Prevent modifying amounts if already approved
  if (expense.approvalStatus === 'APPROVED' && (data.amount || data.expenseCategory)) {
    throw new AppError('Cannot modify amount or category of an APPROVED expense', 400);
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    id,
    { ...data, updatedBy: updaterId },
    { new: true, runValidators: true }
  ).populate('vehicleId').populate('tripId');

  return updatedExpense;
};

const updateApprovalStatus = async (id, approvalStatus, remarks, approverId) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new AppError('Expense record not found', 404);

  if (expense.approvalStatus === approvalStatus) {
    throw new AppError(`Expense is already ${approvalStatus}`, 400);
  }

  expense.approvalStatus = approvalStatus;
  expense.approvedBy = approverId;
  if (remarks) {
    expense.remarks = remarks;
  }
  expense.updatedBy = approverId;

  await expense.save();
  return expense;
};

const deleteExpense = async (id) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new AppError('Expense record not found', 404);

  if (expense.approvalStatus === 'APPROVED') {
    throw new AppError('Cannot delete an APPROVED expense. Reject it first if necessary.', 400);
  }

  await Expense.findByIdAndDelete(id);
};

// Internal API for automatically spawning expenses from other modules
const spawnAutoExpense = async (details, creatorId) => {
  const data = {
    expenseNumber: await generateExpenseNumber(),
    ...details,
    approvalStatus: 'PENDING',
    createdBy: creatorId
  };
  return Expense.create(data);
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  updateApprovalStatus,
  deleteExpense,
  spawnAutoExpense,
};
