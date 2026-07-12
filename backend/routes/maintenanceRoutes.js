const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/constants');
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceStatusSchema,
  maintenanceIdSchema
} = require('../validators/maintenance.validator');

router.use(authMiddleware);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  maintenanceController.getMaintenance
);

router.get(
  '/upcoming',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN, ROLES.SAFETY_OFFICER),
  maintenanceController.getUpcoming
);

router.get(
  '/overdue',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN, ROLES.SAFETY_OFFICER),
  maintenanceController.getOverdue
);

router.get(
  '/vehicle/:vehicleId',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  maintenanceController.getMaintenanceByVehicleId
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST),
  validate(maintenanceIdSchema, 'params'),
  maintenanceController.getMaintenanceById
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenance
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN),
  validate(maintenanceIdSchema, 'params'),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenance
);

router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.TECHNICIAN),
  validate(maintenanceIdSchema, 'params'),
  validate(maintenanceStatusSchema),
  maintenanceController.updateMaintenanceStatus
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(maintenanceIdSchema, 'params'),
  maintenanceController.deleteMaintenance
);
// GET / - list all
router.get('/', maintenanceController.getMaintenanceLogs);

// GET /:id - get log by id
router.get('/:id', maintenanceController.getMaintenanceLogById);

// POST / - create
router.post('/', maintenanceController.createMaintenanceLog);

// PUT /:id - update log
router.put('/:id', maintenanceController.updateMaintenanceLog);

// DELETE /:id - delete log
router.delete('/:id', maintenanceController.deleteMaintenanceLog);
// PUT /:id/close - close maintenance
router.put('/:id/close', maintenanceController.closeMaintenance);

module.exports = router;
