const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// GET / - list all
router.get('/', fuelController.getFuelLogs);

// GET /:id - get log by id
router.get('/:id', fuelController.getFuelLogById);

// POST / - create
router.post('/', fuelController.createFuelLog);

// PUT /:id - update log
router.put('/:id', fuelController.updateFuelLog);

// DELETE /:id - delete log
router.delete('/:id', fuelController.deleteFuelLog);

module.exports = router;
