const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

// GET / - list all - Nitin Singh to implement
router.get('/', maintenanceController.getMaintenanceLogs);

// POST / - create - Nitin Singh to implement
router.post('/', maintenanceController.createMaintenanceLog);

module.exports = router;
