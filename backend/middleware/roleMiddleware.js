/**
 * roleMiddleware.js - Role-Based Access Control middleware for TransitOps.
 *
 * Creates a middleware that restricts route access to specific roles.
 * Must be used AFTER authMiddleware (req.user must be populated).
 *
 * Usage:
 *   const authorize = require('../middleware/roleMiddleware');
 *   const { ROLES } = require('../utils/constants');
 *
 *   router.delete('/:id', auth, authorize(ROLES.ADMIN), controller.delete);
 *   router.get('/', auth, authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER), controller.list);
 */
const AppError = require('../utils/AppError');

/**
 * @param {...string} allowedRoles - One or more role strings.
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError('Access denied. Authentication is required before authorization.', 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
