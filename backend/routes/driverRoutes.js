const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/drivers/available - must be placed before /:id route
router.get('/available', driverController.getAvailableDrivers);

// GET /api/drivers
router.get('/', driverController.getDrivers);

// GET /api/drivers/:id
router.get('/:id', driverController.getDriverById);

// POST /api/drivers
router.post(
  '/',
  roleMiddleware(['SafetyOfficer', 'FleetManager']),
  driverController.createDriver
);

// PUT /api/drivers/:id
router.put(
  '/:id',
  roleMiddleware(['SafetyOfficer', 'FleetManager']),
  driverController.updateDriver
);

// PUT /api/drivers/:id/status
router.put(
  '/:id/status',
  roleMiddleware(['SafetyOfficer', 'FleetManager']),
  driverController.updateDriverStatus
);

// PUT /api/drivers/:id/safety-score
router.put(
  '/:id/safety-score',
  roleMiddleware(['SafetyOfficer']),
  driverController.updateSafetyScore
);

// DELETE /api/drivers/:id
router.delete(
  '/:id',
  roleMiddleware(['FleetManager']),
  driverController.deleteDriver
);

module.exports = router;
