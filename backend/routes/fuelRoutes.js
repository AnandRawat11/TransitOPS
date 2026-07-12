const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes are private
router.use(authMiddleware);

// GET / - list fuel logs (all roles)
router.get('/', fuelController.getFuelLogs);

// GET /:id - get log by id
router.get('/:id', fuelController.getFuelLogById);

// POST / - create fuel log (Driver / FleetManager)
router.post('/', roleMiddleware('Driver', 'FleetManager'), fuelController.createFuelLog);

// PUT /:id - update log (FleetManager only)
router.put('/:id', roleMiddleware('FleetManager'), fuelController.updateFuelLog);

// DELETE /:id - delete fuel log (FleetManager only)
router.delete('/:id', roleMiddleware('FleetManager'), fuelController.deleteFuelLog);

module.exports = router;
