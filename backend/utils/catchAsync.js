/**
 * catchAsync - Higher-order function that wraps async route handlers.
 *
 * Eliminates repetitive try/catch blocks in every controller.
 * Any rejected promise is automatically forwarded to Express's
 * next() error-handling middleware.
 *
 * Usage:
 *   const catchAsync = require('../utils/catchAsync');
 *
 *   exports.getVehicles = catchAsync(async (req, res, next) => {
 *     const vehicles = await Vehicle.find();
 *     sendSuccess(res, 200, 'Vehicles retrieved', vehicles);
 *   });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
