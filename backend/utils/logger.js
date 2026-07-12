/**
 * logger.js - Lightweight logging utility for TransitOps.
 *
 * Wraps console methods with timestamps and log-level prefixes.
 * Designed as a drop-in replacement for raw console.log calls.
 *
 * When the project scales, replace the internals with Winston
 * or Pino without changing any call sites.
 *
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('Server started on port 5000');
 *   logger.error('MongoDB connection failed', error);
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format a log message with ISO timestamp and level prefix.
 * @param {string} level - Log level string.
 * @param {string} message - Log message.
 * @returns {string} Formatted log line.
 */
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
  /**
   * Log informational messages (server start, DB connected, etc.).
   * @param {string} message
   * @param  {...any} args - Additional data to log.
   */
  info(message, ...args) {
    console.log(formatMessage(LOG_LEVELS.INFO, message), ...args);
  },

  /**
   * Log warning messages (deprecation notices, retries, etc.).
   * @param {string} message
   * @param  {...any} args
   */
  warn(message, ...args) {
    console.warn(formatMessage(LOG_LEVELS.WARN, message), ...args);
  },

  /**
   * Log error messages (failures, exceptions, etc.).
   * @param {string} message
   * @param  {...any} args
   */
  error(message, ...args) {
    console.error(formatMessage(LOG_LEVELS.ERROR, message), ...args);
  },

  /**
   * Log debug messages (only visible during development).
   * @param {string} message
   * @param  {...any} args
   */
  debug(message, ...args) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage(LOG_LEVELS.DEBUG, message), ...args);
    }
  },
};

module.exports = logger;
