/**
 * env.js - Centralized environment configuration for TransitOps.
 *
 * Validates that all required environment variables are present
 * at startup. Exports a typed config object so the rest of the
 * codebase never accesses process.env directly.
 *
 * Usage:
 *   const config = require('../config/env');
 *   mongoose.connect(config.mongoUri);
 */
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the backend root directory.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * List of environment variables that MUST be defined.
 * The server will refuse to start if any are missing in production.
 */
const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET'];

/**
 * Validate that required environment variables are set.
 * In development mode, missing vars produce warnings.
 * In production mode, missing vars throw a fatal error.
 */
const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }

    // In development, warn but allow fallback values.
    console.warn(`[WARN] ${message}. Using fallback defaults for development.`);
  }
};

validateEnv();

const config = Object.freeze({
  /** Server port. */
  port: parseInt(process.env.PORT, 10) || 5000,

  /** MongoDB connection string. Falls back to MONGO_URI for backward compatibility. */
  mongoUri:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/transitops',

  /** JWT signing secret. */
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_do_not_use_in_prod',

  /** JWT token expiry duration. */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  /** Current environment. */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** Whether the app is running in production. */
  isProduction: process.env.NODE_ENV === 'production',
});

module.exports = config;
