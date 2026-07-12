/**
 * authController.js - Authentication controller for TransitOps.
 *
 * Handles incoming HTTP requests for authentication, delegating
 * business logic to the auth.service.
 *
 * All functions are wrapped in catchAsync, so unhandled promise
 * rejections are automatically forwarded to the global error handler.
 */
const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const eventBus = require('../utils/eventBus');

/**
 * POST /api/v1/auth/register
 * Register a new user and return a JWT token.
 */
const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  
  sendSuccess(res, 201, 'User registered successfully', {
    token,
    user,
  });
});

/**
 * POST /api/v1/auth/login
 * Authenticate a user and return a JWT token.
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  
  eventBus.emit('USER_LOGIN', { userId: user._id });

  sendSuccess(res, 200, 'Login successful', {
    token,
    user,
  });
});

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user's profile.
 * Requires authMiddleware to run first.
 */
const getMe = catchAsync(async (req, res) => {
  // req.user is populated by authMiddleware.
  // We use toJSON() to strip the password if it somehow wasn't already stripped.
  sendSuccess(res, 200, 'User profile retrieved successfully', {
    user: req.user.toJSON ? req.user.toJSON() : req.user,
  });
});

module.exports = {
  register,
  login,
  getMe,
};
