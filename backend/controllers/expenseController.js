/**
 * expenseController.js - Expense endpoints controller.
 */
const expenseService = require('../services/expense.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user.id);
  sendSuccess(res, 201, 'Expense record created successfully', expense);
});

const getExpenses = catchAsync(async (req, res) => {
  const result = await expenseService.getAllExpenses(req.query);
  res.status(200).json({
    success: true,
    message: 'Expense records retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});

const getExpenseById = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  sendSuccess(res, 200, 'Expense record retrieved successfully', expense);
});

const updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Expense updated successfully', expense);
});

const updateApprovalStatus = catchAsync(async (req, res) => {
  const { approvalStatus, remarks } = req.body;
  const expense = await expenseService.updateApprovalStatus(req.params.id, approvalStatus, remarks, req.user.id);
  sendSuccess(res, 200, 'Approval status updated successfully', expense);
});

const deleteExpense = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);
  sendSuccess(res, 200, 'Expense record deleted successfully');
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  updateApprovalStatus,
  deleteExpense,
};
