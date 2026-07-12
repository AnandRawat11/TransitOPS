const Joi = require('joi');
const { 
  MAINTENANCE_STATUS_ARRAY, 
  MAINTENANCE_PRIORITY_ARRAY,
  MAINTENANCE_TYPE_ARRAY
} = require('../utils/constants');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const partSchema = Joi.object({
  partName: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  cost: Joi.number().min(0).required(),
});

const createMaintenanceSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  assignedTechnician: Joi.string().pattern(objectIdPattern).optional().allow(null),
  maintenanceType: Joi.string().valid(...MAINTENANCE_TYPE_ARRAY).required(),
  priority: Joi.string().valid(...MAINTENANCE_PRIORITY_ARRAY).optional(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(5).required(),
  issueCategory: Joi.string().allow('', null),
  scheduledDate: Joi.date().iso().optional().allow(null),
  estimatedCost: Joi.number().min(0).optional().allow(null),
  estimatedDuration: Joi.number().min(0).optional().allow(null),
  odometerReading: Joi.number().min(0).optional().allow(null),
  workshopName: Joi.string().allow('', null),
  serviceCenter: Joi.string().allow('', null),
});

const updateMaintenanceSchema = Joi.object({
  assignedTechnician: Joi.string().pattern(objectIdPattern).optional().allow(null),
  maintenanceType: Joi.string().valid(...MAINTENANCE_TYPE_ARRAY),
  priority: Joi.string().valid(...MAINTENANCE_PRIORITY_ARRAY),
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(5),
  issueCategory: Joi.string().allow('', null),
  scheduledDate: Joi.date().iso().allow(null),
  startedAt: Joi.date().iso().allow(null),
  completedAt: Joi.date().iso().allow(null),
  estimatedCost: Joi.number().min(0).allow(null),
  actualCost: Joi.number().min(0).allow(null),
  estimatedDuration: Joi.number().min(0).allow(null),
  actualDuration: Joi.number().min(0).allow(null),
  odometerReading: Joi.number().min(0).allow(null),
  nextServiceOdometer: Joi.number().min(0).allow(null),
  nextServiceDate: Joi.date().iso().allow(null),
  workshopName: Joi.string().allow('', null),
  serviceCenter: Joi.string().allow('', null),
  partsReplaced: Joi.array().items(partSchema).optional(),
  remarks: Joi.string().allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

const maintenanceStatusSchema = Joi.object({
  status: Joi.string().valid(...MAINTENANCE_STATUS_ARRAY).required().messages({
    'any.only': `Status must be one of: ${MAINTENANCE_STATUS_ARRAY.join(', ')}`,
    'any.required': 'Status is required'
  }),
  notes: Joi.string().allow('', null).optional(),
});

const maintenanceIdSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid maintenance ID format',
    'any.required': 'Maintenance ID is required',
  }),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceStatusSchema,
  maintenanceIdSchema,
};
