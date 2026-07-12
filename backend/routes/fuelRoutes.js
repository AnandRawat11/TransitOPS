const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET / - list all
router.get('/', fuelController.getFuelLogs);

// GET /:id - get log by id
router.get('/:id', fuelController.getFuelLogById);

// POST / - create
router.post('/', fuelController.createFuelLog);
// All routes are private
router.use(authMiddleware);

// GET / - list fuel logs (all roles)
router.get('/', fuelController.getFuelLogs);

// POST / - create fuel log (Driver / FleetManager)
router.post('/', roleMiddleware(['Driver', 'FleetManager']), fuelController.createFuelLog);

// DELETE /:id - delete fuel log (FleetManager only)
router.delete('/:id', roleMiddleware(['FleetManager']), fuelController.deleteFuelLog);

// PUT /:id - update log
router.put('/:id', fuelController.updateFuelLog);

// DELETE /:id - delete log
router.delete('/:id', fuelController.deleteFuelLog);

module.exports = router;
