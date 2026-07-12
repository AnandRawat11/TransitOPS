const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// POST /api/v1/auth/register - Register a user (public)
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login - Login a user (public)
router.post('/login', validate(loginSchema), authController.login);

// GET /api/v1/auth/me - Get current user profile (protected)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
