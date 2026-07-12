/**
 * authMiddleware.js - JWT authentication middleware for TransitOps.
 *
 * Responsibilities:
 *   1. Extract Bearer token from the Authorization header.
 *   2. Verify the token signature and expiry.
 *   3. Fetch the full user document from MongoDB (excluding password).
 *   4. Reject deactivated users (isActive === false).
 *   5. Attach the authenticated user to req.user.
 *   6. Provide distinct error messages for expired vs. invalid tokens.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');

const authMiddleware = catchAsync(async (req, res, next) => {
  // 1. Check for Authorization header.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Please provide a valid token.', 401);
  }

  // 2. Extract and verify the token.
  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please log in again.', 401);
    }
    throw new AppError('Invalid token. Please log in again.', 401);
  }

  // 3. Fetch the user from the database.
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  // 4. Check if user account is active.
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  // 5. Attach user to request.
  req.user = user;
  next();
});

module.exports = authMiddleware;
