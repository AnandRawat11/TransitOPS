const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are private
router.use(authMiddleware);

// GET /operational-cost - Operational cost per vehicle
router.get('/operational-cost', reportController.getOperationalCost);

// GET /fuel-efficiency - Fuel efficiency per vehicle
router.get('/fuel-efficiency', reportController.getFuelEfficiency);

// GET /fleet-utilization - General utilization of active fleet
router.get('/fleet-utilization', reportController.getFleetUtilization);

// GET /roi - ROI analysis per vehicle
router.get('/roi', reportController.getVehicleROI);

// GET /export/csv - Download combined fleet data as CSV
router.get('/export/csv', reportController.exportCSV);

module.exports = router;
