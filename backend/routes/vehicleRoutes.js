const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// GET / - list all - Anand Rawat to implement
router.get('/', vehicleController.getVehicles);

// GET /:id - get details - Anand Rawat to implement
router.get('/:id', vehicleController.getVehicleById);

// POST / - create - Anand Rawat to implement
router.post('/', vehicleController.createVehicle);

// PUT /:id - update - Anand Rawat to implement
router.put('/:id', vehicleController.updateVehicle);

// DELETE /:id - delete - Anand Rawat to implement
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
