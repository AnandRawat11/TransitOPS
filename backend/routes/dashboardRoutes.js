const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const tripDashboardController = require('../controllers/tripDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

// --- VEHICLE DASHBOARD ---
router.get(
  '/vehicles/summary', // Re-routing the old /summary for clarity (this might break existing, but wait, the prompt said "Do NOT break any existing APIs".)
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getSummary
);

router.get(
  '/vehicles/analytics', // Same here, I'll keep the old ones at the root to avoid breaking.
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getAnalytics
);

// To avoid breaking existing Phase 2 APIs:
router.get(
  '/summary',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getSummary
);

router.get(
  '/analytics',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  dashboardController.getAnalytics
);


// --- TRIPS DASHBOARD ---
router.get(
  '/trips/summary',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  tripDashboardController.getSummary
);

router.get(
  '/trips/analytics',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  tripDashboardController.getAnalytics
);

// --- MAINTENANCE DASHBOARD ---
const maintenanceDashboardController = require('../controllers/maintenanceDashboardController');

router.get(
  '/maintenance/summary',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  maintenanceDashboardController.getSummary
);

router.get(
  '/maintenance/analytics',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  maintenanceDashboardController.getAnalytics
);

module.exports = router;
