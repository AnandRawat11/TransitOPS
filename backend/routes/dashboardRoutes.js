const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /stats - get dashboard stats - Deepika to implement
router.get('/stats', dashboardController.getStats);

module.exports = router;
