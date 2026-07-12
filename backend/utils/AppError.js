/**
 * AppError - Custom operational error class for TransitOps.
 *
 * Extends the native Error class with HTTP status codes and an
 * `isOperational` flag so the global error handler can distinguish
 * expected business errors from unexpected programming bugs.
 *
 * Usage:
 *   throw new AppError('Vehicle not found', 404);
 *   throw new AppError('Email already registered', 409);
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500).
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding the constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
