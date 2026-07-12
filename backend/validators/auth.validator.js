/**
 * auth.validator.js - Joi validation schemas for authentication endpoints.
 *
 * Schemas:
 *   - registerSchema: POST /api/auth/register
 *   - loginSchema:    POST /api/auth/login
 */
const Joi = require('joi');
const { ROLES_ARRAY } = require('../utils/constants');

/**
 * Password must be at least 8 characters and contain:
 *   - 1 uppercase letter
 *   - 1 lowercase letter
 *   - 1 digit
 */
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordMessage =
  'Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 digit';

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().pattern(passwordPattern).required().messages({
    'string.pattern.base': passwordMessage,
    'any.required': 'Password is required',
  }),

  role: Joi.string()
    .valid(...ROLES_ARRAY)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
      'any.required': 'Role is required',
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^\+?[\d\s-]{7,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
