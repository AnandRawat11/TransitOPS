const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/constants');
const {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
  vehicleStatusSchema
} = require('../validators/vehicle.validator');

// All vehicle routes require authentication
router.use(authMiddleware);

// GET /api/v1/vehicles/available - get available vehicles (Trips module support)
router.get(
  '/available',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  vehicleController.getAvailableVehicles
);

// GET /api/v1/vehicles - list all
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  vehicleController.getVehicles
);

// GET /api/v1/vehicles/:id - get details
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER),
  validate(vehicleIdSchema, 'params'),
  vehicleController.getVehicleById
);

// POST /api/v1/vehicles - create (Admin only)
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

// PUT /api/v1/vehicles/:id - update (Admin, Fleet Manager)
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(vehicleIdSchema, 'params'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

// PATCH /api/v1/vehicles/:id/status - update status
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(vehicleIdSchema, 'params'),
  validate(vehicleStatusSchema),
  vehicleController.updateVehicleStatus
);

// DELETE /api/v1/vehicles/:id - delete (Admin only)
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(vehicleIdSchema, 'params'),
  vehicleController.deleteVehicle
);

module.exports = router;
