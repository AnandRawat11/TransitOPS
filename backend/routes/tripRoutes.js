const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/constants');
const {
  createTripSchema,
  updateTripSchema,
  tripStatusSchema,
  tripIdSchema
} = require('../validators/trip.validator');

// All trip routes require authentication
router.use(authMiddleware);

// GET /api/v1/trips
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  tripController.getTrips
);

// GET /api/v1/trips/:id
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  validate(tripIdSchema, 'params'),
  tripController.getTripById
);

// POST /api/v1/trips - Admin, Fleet Manager
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(createTripSchema),
  tripController.createTrip
);

// PUT /api/v1/trips/:id - Admin, Fleet Manager
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(tripIdSchema, 'params'),
  validate(updateTripSchema),
  tripController.updateTrip
);

// PATCH /api/v1/trips/:id/status - Admin, Fleet Manager, Driver
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER),
  validate(tripIdSchema, 'params'),
  validate(tripStatusSchema),
  tripController.updateTripStatus
);

// DELETE /api/v1/trips/:id - Admin only
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(tripIdSchema, 'params'),
  tripController.deleteTrip
);

module.exports = router;
