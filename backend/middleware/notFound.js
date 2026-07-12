/**
 * notFound.js - 404 handler for unmatched routes.
 *
 * Must be mounted AFTER all route definitions and BEFORE
 * the global error handler in server.js.
 */
const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

module.exports = notFound;
