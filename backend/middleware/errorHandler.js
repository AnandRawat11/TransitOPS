/**
 * errorHandler.js - Global error handling middleware for TransitOps.
 *
 * Classifies errors from Mongoose, JWT, and the application's own
 * AppError class, then sends a consistent JSON response.
 *
 * Development mode includes the full error stack.
 * Production mode hides internal details for security.
 */
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Extract a user-friendly error from a Mongoose ValidationError.
 * @param {Error} err - Mongoose ValidationError.
 * @returns {{ message: string, errors: object }}
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return {
    statusCode: 400,
    message: 'Validation failed',
    errors,
  };
};

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId).
 * @param {Error} err
 * @returns {{ statusCode: number, message: string }}
 */
const handleCastError = (err) => ({
  statusCode: 400,
  message: `Invalid value for ${err.path}: ${err.value}`,
});

/**
 * Handle MongoDB duplicate key error (code 11000).
 * @param {Error} err
 * @returns {{ statusCode: number, message: string }}
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  return {
    statusCode: 409,
    message: `Duplicate value for field: ${field}. Please use a different value.`,
  };
};

/**
 * Handle JWT-related errors.
 * @param {Error} err
 * @returns {{ statusCode: number, message: string }}
 */
const handleJWTError = () => ({
  statusCode: 401,
  message: 'Invalid token. Please log in again.',
});

/**
 * Handle expired JWT tokens.
 * @returns {{ statusCode: number, message: string }}
 */
const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: 'Token has expired. Please log in again.',
});

// ──────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values.
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Classify known error types.
  if (err.name === 'ValidationError') {
    const handled = handleMongooseValidationError(err);
    statusCode = handled.statusCode;
    message = handled.message;
    errors = handled.errors;
  } else if (err.name === 'CastError') {
    const handled = handleCastError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.code === 11000) {
    const handled = handleDuplicateKeyError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'JsonWebTokenError') {
    const handled = handleJWTError();
    statusCode = handled.statusCode;
    message = handled.message;
  } else if (err.name === 'TokenExpiredError') {
    const handled = handleJWTExpiredError();
    statusCode = handled.statusCode;
    message = handled.message;
  }

  // Log the error.
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, err.stack || '');
  } else {
    logger.warn(`[${statusCode}] ${message}`);
  }

  // Build response.
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.error = errors;
  }

  // Include stack trace in development only.
  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
