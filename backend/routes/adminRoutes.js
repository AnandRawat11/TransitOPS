const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);
router.use(authorize(ROLES.ADMIN)); // Extremely strict RBAC

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
