/**
 * validate.js - Joi validation middleware factory for TransitOps.
 *
 * Creates Express middleware that validates request data against
 * a Joi schema. Supports validating body, params, and query.
 *
 * Usage:
 *   const validate = require('../middleware/validate');
 *   const { createVehicleSchema } = require('../validators/vehicle.validator');
 *
 *   router.post('/', validate(createVehicleSchema), controller.create);
 *   router.get('/:id', validate(idSchema, 'params'), controller.getById);
 */
const { sendError } = require('../utils/apiResponse');

/**
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against.
 * @param {'body'|'params'|'query'} [source='body'] - Request property to validate.
 * @returns {import('express').RequestHandler} Express middleware.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return sendError(res, 400, 'Validation failed', details);
    }

    // Replace raw input with validated & sanitized values.
    req[source] = value;
    next();
  };
};

module.exports = validate;
