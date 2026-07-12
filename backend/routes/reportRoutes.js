const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET / - generate report - Saurav Shandilya to implement
router.get('/', reportController.getReports);

module.exports = router;
