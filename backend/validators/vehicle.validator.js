/**
 * vehicle.validator.js - Joi validation schemas for vehicle endpoints.
 *
 * Schemas:
 *   - createVehicleSchema: POST /api/vehicles
 *   - updateVehicleSchema: PUT  /api/vehicles/:id
 *   - vehicleIdSchema:     Validates :id param as a MongoDB ObjectId
 */
const Joi = require('joi');
const {
  VEHICLE_STATUS_ARRAY,
  VEHICLE_TYPES_ARRAY,
  FUEL_TYPES_ARRAY,
} = require('../utils/constants');

/**
 * MongoDB ObjectId pattern (24-character hex string).
 */
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createVehicleSchema = Joi.object({
  registrationNumber: Joi.string().trim().uppercase().min(3).max(20).required().messages({
    'any.required': 'Registration number is required',
    'string.min': 'Registration number must be at least 3 characters',
    'string.max': 'Registration number must not exceed 20 characters',
  }),

  vehicleName: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Vehicle name is required',
    'string.min': 'Vehicle name must be at least 2 characters',
  }),

  vehicleType: Joi.string()
    .valid(...VEHICLE_TYPES_ARRAY)
    .required()
    .messages({
      'any.only': `Vehicle type must be one of: ${VEHICLE_TYPES_ARRAY.join(', ')}`,
      'any.required': 'Vehicle type is required',
    }),

  manufacturer: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Manufacturer is required',
  }),

  model: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Model is required',
  }),

  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
    'number.min': 'Year must be 1900 or later',
    'number.max': `Year must not exceed ${new Date().getFullYear() + 1}`,
    'any.required': 'Year is required',
  }),

  maxLoad: Joi.number().positive().optional().messages({
    'number.positive': 'Max load must be a positive number',
  }),

  fuelType: Joi.string()
    .valid(...FUEL_TYPES_ARRAY)
    .required()
    .messages({
      'any.only': `Fuel type must be one of: ${FUEL_TYPES_ARRAY.join(', ')}`,
      'any.required': 'Fuel type is required',
    }),

  odometer: Joi.number().min(0).default(0).messages({
    'number.min': 'Odometer reading cannot be negative',
  }),

  acquisitionCost: Joi.number().min(0).optional().messages({
    'number.min': 'Acquisition cost cannot be negative',
  }),

  currentStatus: Joi.string()
    .valid(...VEHICLE_STATUS_ARRAY)
    .default('AVAILABLE')
    .messages({
      'any.only': `Status must be one of: ${VEHICLE_STATUS_ARRAY.join(', ')}`,
    }),

  region: Joi.string().trim().max(100).optional(),

  chassisNumber: Joi.string().trim().max(50).optional(),

  insuranceExpiry: Joi.date().iso().optional().messages({
    'date.format': 'Insurance expiry must be a valid ISO date',
  }),

  fitnessExpiry: Joi.date().iso().optional().messages({
    'date.format': 'Fitness expiry must be a valid ISO date',
  }),

  pollutionExpiry: Joi.date().iso().optional().messages({
    'date.format': 'Pollution expiry must be a valid ISO date',
  }),
});

const updateVehicleSchema = Joi.object({
  registrationNumber: Joi.string().trim().uppercase().min(3).max(20),
  vehicleName: Joi.string().trim().min(2).max(100),
  vehicleType: Joi.string().valid(...VEHICLE_TYPES_ARRAY),
  manufacturer: Joi.string().trim().min(2).max(100),
  model: Joi.string().trim().min(1).max(100),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  maxLoad: Joi.number().positive(),
  fuelType: Joi.string().valid(...FUEL_TYPES_ARRAY),
  odometer: Joi.number().min(0),
  acquisitionCost: Joi.number().min(0),
  currentStatus: Joi.string().valid(...VEHICLE_STATUS_ARRAY),
  region: Joi.string().trim().max(100),
  chassisNumber: Joi.string().trim().max(50),
  insuranceExpiry: Joi.date().iso(),
  fitnessExpiry: Joi.date().iso(),
  pollutionExpiry: Joi.date().iso(),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

const vehicleIdSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid vehicle ID format',
    'any.required': 'Vehicle ID is required',
  }),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
};
