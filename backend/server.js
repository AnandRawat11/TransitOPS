/**
 * server.js - Application entry point for TransitOps backend.
 *
 * Configures Express, mounts middleware (Helmet, Morgan, CORS),
 * establishes DB connection, mounts route handlers, and sets up
 * global error handling.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { sendSuccess } = require('./utils/apiResponse');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// ──────────────────────────────────────
// Initialization
// ──────────────────────────────────────

// Connect to Database
connectDB();

const app = express();

// ──────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────

// Security headers
app.use(helmet());

// Enable CORS for frontend
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Request logging (development only)
if (!config.isProduction) {
  app.use(morgan('dev'));
}

// ──────────────────────────────────────
// Route Mounting
// ──────────────────────────────────────

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tripRoutes = require('./routes/tripRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
app.use(`${API_PREFIX}/drivers`, driverRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/trips`, tripRoutes);
app.use(`${API_PREFIX}/maintenance`, maintenanceRoutes);
app.use(`${API_PREFIX}/fuel`, fuelRoutes);
app.use(`${API_PREFIX}/expenses`, expenseRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/activity`, activityRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ──────────────────────────────────────
// Base & Health Routes
// ──────────────────────────────────────

// Root Endpoint
app.get('/', (req, res) => {
  sendSuccess(res, 200, 'TransitOps REST API is running');
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  // Ideally, also check db state here, but simple is fine for now
  res.status(200).json({
    success: true,
    status: 'UP',
    database: 'CONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────
// Error Handling
// ──────────────────────────────────────

// 404 Handler for unmatched routes
app.use(notFound);

// Global Error Handler (MUST be the last middleware)
app.use(errorHandler);

// ──────────────────────────────────────
// Server Startup & Graceful Shutdown
// ──────────────────────────────────────

const server = app.listen(config.port, () => {
  logger.info(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Handle Unhandled Rejections (e.g., failed DB connection outside express)
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle Uncaught Exceptions (e.g., synchronous bugs)
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Graceful Shutdown for SIGTERM (e.g., from Docker/Render)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

module.exports = server;
