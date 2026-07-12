const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware
router.use(authMiddleware);

// GET /api/dashboard/kpis
router.get('/kpis', dashboardController.getKpis);

module.exports = router;
