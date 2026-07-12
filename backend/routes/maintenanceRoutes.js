const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

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
