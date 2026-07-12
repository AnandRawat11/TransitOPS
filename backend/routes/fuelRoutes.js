const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// GET / - list all - Saurav Shandilya to implement
router.get('/', fuelController.getFuelLogs);

// POST / - create - Saurav Shandilya to implement
router.post('/', fuelController.createFuelLog);

module.exports = router;
