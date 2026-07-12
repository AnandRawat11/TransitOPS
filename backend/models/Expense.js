/**
 * Expense.js - Mongoose model for tracking general ledger and fleet expenses.
 */
const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES_ARRAY, APPROVAL_STATUS_ARRAY, APPROVAL_STATUS } = require('../utils/constants');

const ExpenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    maintenanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceLog',
      default: null,
    },
    expenseCategory: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES_ARRAY,
        message: 'Expense category must be one of: ' + EXPENSE_CATEGORIES_ARRAY.join(', '),
      },
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    vendor: {
      type: String,
      trim: true,
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: null,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: null,
    },
    receipt: {
      type: String, // URL to S3/Cloud storage
      default: null,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: APPROVAL_STATUS_ARRAY,
        message: 'Approval status must be one of: ' + APPROVAL_STATUS_ARRAY.join(', '),
      },
      default: APPROVAL_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast retrieval
ExpenseSchema.index({ expenseNumber: 1 });
ExpenseSchema.index({ vehicleId: 1 });
ExpenseSchema.index({ tripId: 1 });
ExpenseSchema.index({ expenseCategory: 1 });
ExpenseSchema.index({ approvalStatus: 1 });
ExpenseSchema.index({ expenseDate: -1 });

// JSON Transform
ExpenseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
