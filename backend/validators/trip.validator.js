const Joi = require('joi');
const { TRIP_STATUS_ARRAY, TRIP_PRIORITY_ARRAY } = require('../utils/constants');

// Generic ObjectId validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createTripSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).optional().allow(null),
  driverId: Joi.string().pattern(objectIdPattern).optional().allow(null),
  startLocation: Joi.string().min(2).max(200).required(),
  destination: Joi.string().min(2).max(200).required(),
  route: Joi.string().allow('', null),
  plannedDistance: Joi.number().positive().required(),
  plannedStartTime: Joi.date().iso().required(),
  plannedEndTime: Joi.date().iso().greater(Joi.ref('plannedStartTime')).required().messages({
    'date.greater': 'Planned end time must be after planned start time',
  }),
  cargoType: Joi.string().min(2).max(100).required(),
  cargoWeight: Joi.number().positive().required(),
  priority: Joi.string().valid(...TRIP_PRIORITY_ARRAY).optional(),
  estimatedFuel: Joi.number().positive().optional(),
  notes: Joi.string().allow('', null),
});

const updateTripSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).optional().allow(null),
  driverId: Joi.string().pattern(objectIdPattern).optional().allow(null),
  startLocation: Joi.string().min(2).max(200),
  destination: Joi.string().min(2).max(200),
  route: Joi.string().allow('', null),
  plannedDistance: Joi.number().positive(),
  actualDistance: Joi.number().positive().allow(null),
  plannedStartTime: Joi.date().iso(),
  actualStartTime: Joi.date().iso().allow(null),
  plannedEndTime: Joi.date().iso().greater(Joi.ref('plannedStartTime')),
  actualEndTime: Joi.date().iso().allow(null),
  cargoType: Joi.string().min(2).max(100),
  cargoWeight: Joi.number().positive(),
  priority: Joi.string().valid(...TRIP_PRIORITY_ARRAY),
  estimatedFuel: Joi.number().positive().allow(null),
  actualFuel: Joi.number().positive().allow(null),
  notes: Joi.string().allow('', null),
  startOdometer: Joi.number().min(0).allow(null),
  endOdometer: Joi.number().min(0).allow(null),
  delayReason: Joi.string().allow('', null),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

const tripStatusSchema = Joi.object({
  status: Joi.string().valid(...TRIP_STATUS_ARRAY).required().messages({
    'any.only': `Status must be one of: ${TRIP_STATUS_ARRAY.join(', ')}`,
    'any.required': 'Status is required'
  }),
  notes: Joi.string().allow('', null).optional(),
});

const tripIdSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid trip ID format',
    'any.required': 'Trip ID is required',
  }),
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  tripStatusSchema,
  tripIdSchema,
};
