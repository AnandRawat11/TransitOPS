const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// GET / - list all - Deepika to implement
router.get('/', driverController.getDrivers);

// POST / - create - Deepika to implement
router.post('/', driverController.createDriver);

module.exports = router;
