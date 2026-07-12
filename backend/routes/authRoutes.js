const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Register a user
router.post('/register', authController.register);

// POST /api/auth/login - Login a user
router.post('/login', authController.login);

module.exports = router;
