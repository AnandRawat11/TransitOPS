const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

// All AI routes require authentication and FLEET_MANAGER/ADMIN/FINANCIAL_ANALYST roles
// Drivers do not need to see fleet-wide AI insights
router.use(authMiddleware);
router.use(authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST));

router.get('/fleet-health', aiController.getFleetHealth);
router.get('/predictive-maintenance', aiController.getPredictiveMaintenance);
router.get('/fuel-analysis', aiController.getFuelAnalysis);
router.get('/driver-performance', aiController.getDriverPerformance);
router.get('/cost-prediction', aiController.getCostPrediction);
router.post('/copilot/chat', aiController.chatCopilot);

module.exports = router;
