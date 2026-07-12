/**
 * db.js - MongoDB connection manager for TransitOps.
 *
 * Features:
 *   - Automatic retry with exponential backoff (up to 3 attempts)
 *   - Mongoose connection event listeners for monitoring
 *   - Structured logging via the logger utility
 *   - Uses centralized config for the connection string
 */
const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

/** Maximum number of connection attempts before giving up. */
const MAX_RETRIES = 3;

/** Base delay in ms between retries (doubles each attempt). */
const BASE_DELAY_MS = 2000;

/**
 * Connect to MongoDB with retry logic.
 * @param {number} [attempt=1] - Current attempt number (used internally for recursion).
 * @returns {Promise<void>}
 */
const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (error) {
    logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);

    if (attempt >= MAX_RETRIES) {
      logger.error('All MongoDB connection attempts exhausted. Exiting.');
      process.exit(1);
    }

    const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    logger.warn(`Retrying MongoDB connection in ${delayMs / 1000}s...`);

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return connectDB(attempt + 1);
  }
};

// ──────────────────────────────────────
// Mongoose Connection Event Listeners
// ──────────────────────────────────────

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connection established.');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose connection disconnected.');
});

module.exports = connectDB;
