/**
 * auth.service.js - Authentication business logic for TransitOps.
 *
 * Encapsulates user registration, login, and token generation.
 * Controllers delegate to this service and handle HTTP concerns only.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const config = require('../config/env');

/**
 * Generate a signed JWT for a given user.
 * @param {object} user - Mongoose user document.
 * @returns {string} Signed JWT token.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Register a new user.
 *
 * @param {object} data - Registration data (name, email, password, role, phone?).
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {AppError} 409 if email is already registered.
 */
const registerUser = async (data) => {
  const { name, email, password, role, phone } = data;

  // Check for existing user with the same email.
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409);
  }

  // Create user (password hashing is handled by the pre-save hook).
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone: phone || null,
  });

  const token = generateToken(user);

  // Return sanitized user (toJSON transform strips password).
  return { user: user.toJSON(), token };
};

/**
 * Authenticate a user with email and password.
 *
 * @param {string} email - User's email address.
 * @param {string} password - Plain-text password.
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {AppError} 401 if credentials are invalid or account is deactivated.
 */
const loginUser = async (email, password) => {
  // Find user and explicitly include the password field.
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is active.
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  // Verify password.
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user);

  // Return sanitized user (toJSON transform strips password).
  return { user: user.toJSON(), token };
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
};
