/**
 * apiResponse.js - Consistent API response helpers for TransitOps.
 *
 * Every API response follows a uniform shape:
 *
 * Success:
 *   { success: true,  message: "...", data: { ... } }
 *
 * Error:
 *   { success: false, message: "...", error: { ... } }
 *
 * Usage:
 *   const { sendSuccess, sendError } = require('../utils/apiResponse');
 *   sendSuccess(res, 200, 'Vehicles retrieved', vehicles);
 *   sendError(res, 404, 'Vehicle not found');
 */

/**
 * Send a standardized success response.
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (200, 201, etc.).
 * @param {string} message - Human-readable success message.
 * @param {*} [data=null] - Response payload (object, array, null).
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 * @param {import('express').Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (400, 401, 404, 500, etc.).
 * @param {string} message - Human-readable error message.
 * @param {*} [errors=null] - Optional detailed error info (validation, etc.).
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.error = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
