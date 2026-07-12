const Joi = require('joi');
const { 
  FUEL_TYPES_ARRAY,
  EXPENSE_CATEGORIES_ARRAY,
  APPROVAL_STATUS_ARRAY
} = require('../utils/constants');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// --- FUEL VALIDATORS ---
const createFuelLogSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  driverId: Joi.string().pattern(objectIdPattern).required(),
  tripId: Joi.string().pattern(objectIdPattern).optional().allow(null, ''),
  fuelStation: Joi.string().min(2).required(),
  fuelType: Joi.string().valid(...FUEL_TYPES_ARRAY).required(),
  quantity: Joi.number().positive().required(),
  pricePerUnit: Joi.number().min(0).required(),
  totalCost: Joi.number().min(0).required(),
  odometerReading: Joi.number().min(0).required(),
  paymentMethod: Joi.string().allow('', null),
  invoiceNumber: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  filledAt: Joi.date().iso().optional(),
});

const updateFuelLogSchema = Joi.object({
  fuelStation: Joi.string().min(2),
  fuelType: Joi.string().valid(...FUEL_TYPES_ARRAY),
  quantity: Joi.number().positive(),
  pricePerUnit: Joi.number().min(0),
  totalCost: Joi.number().min(0),
  odometerReading: Joi.number().min(0),
  paymentMethod: Joi.string().allow('', null),
  invoiceNumber: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  filledAt: Joi.date().iso(),
}).min(1);

// --- EXPENSE VALIDATORS ---
const createExpenseSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).optional().allow(null, ''),
  tripId: Joi.string().pattern(objectIdPattern).optional().allow(null, ''),
  maintenanceId: Joi.string().pattern(objectIdPattern).optional().allow(null, ''),
  expenseCategory: Joi.string().valid(...EXPENSE_CATEGORIES_ARRAY).required(),
  title: Joi.string().min(3).required(),
  description: Joi.string().allow('', null),
  amount: Joi.number().min(0).required(),
  vendor: Joi.string().allow('', null),
  invoiceNumber: Joi.string().allow('', null),
  paymentMethod: Joi.string().allow('', null),
  expenseDate: Joi.date().iso().optional(),
  remarks: Joi.string().allow('', null),
});

const updateExpenseSchema = Joi.object({
  expenseCategory: Joi.string().valid(...EXPENSE_CATEGORIES_ARRAY),
  title: Joi.string().min(3),
  description: Joi.string().allow('', null),
  amount: Joi.number().min(0),
  vendor: Joi.string().allow('', null),
  invoiceNumber: Joi.string().allow('', null),
  paymentMethod: Joi.string().allow('', null),
  expenseDate: Joi.date().iso(),
  remarks: Joi.string().allow('', null),
}).min(1);

const updateApprovalSchema = Joi.object({
  approvalStatus: Joi.string().valid(...APPROVAL_STATUS_ARRAY).required(),
  remarks: Joi.string().allow('', null),
});

const idSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required(),
});

module.exports = {
  createFuelLogSchema,
  updateFuelLogSchema,
  createExpenseSchema,
  updateExpenseSchema,
  updateApprovalSchema,
  idSchema,
};
