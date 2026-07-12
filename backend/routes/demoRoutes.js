const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);
router.use(authorize(ROLES.ADMIN));

// Danger: Only for Demo / Hackathon use
router.post('/seed', demoController.seedDemoData);
router.post('/reset', demoController.resetDemoData);

module.exports = router;
