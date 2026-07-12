const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/constants');
const {
  createFuelLogSchema,
  updateFuelLogSchema,
  idSchema
} = require('../validators/finance.validator');

router.use(authMiddleware);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST, ROLES.SAFETY_OFFICER),
  fuelController.getFuelLogs
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST, ROLES.SAFETY_OFFICER),
  validate(idSchema, 'params'),
  fuelController.getFuelLogById
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER),
  validate(createFuelLogSchema),
  fuelController.createFuelLog
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(idSchema, 'params'),
  validate(updateFuelLogSchema),
  fuelController.updateFuelLog
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idSchema, 'params'),
  fuelController.deleteFuelLog
);

module.exports = router;
