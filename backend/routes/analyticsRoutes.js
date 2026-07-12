const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);
router.use(authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST));

router.get('/dashboard', analyticsController.getDashboard);
router.get('/export', analyticsController.exportReport);

router.post('/schedules', analyticsController.createScheduledReport);
router.get('/schedules', analyticsController.getScheduledReports);

module.exports = router;
