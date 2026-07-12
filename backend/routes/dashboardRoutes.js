const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware
router.use(authMiddleware);

// GET /api/dashboard/kpis
router.get('/kpis', dashboardController.getKpis);
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

// GET /api/v1/dashboard/summary
router.get(
  '/summary',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getSummary
);

// GET /api/v1/dashboard/analytics
router.get(
  '/analytics',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getAnalytics
);

module.exports = router;
