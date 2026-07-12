const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { ROLES } = require('../utils/constants');
const {
  createExpenseSchema,
  updateExpenseSchema,
  updateApprovalSchema,
  idSchema
} = require('../validators/finance.validator');

router.use(authMiddleware);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  expenseController.getExpenses
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  validate(idSchema, 'params'),
  expenseController.getExpenseById
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  validate(createExpenseSchema),
  expenseController.createExpense
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST),
  validate(idSchema, 'params'),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

router.patch(
  '/:id/approve',
  authorize(ROLES.ADMIN, ROLES.FINANCIAL_ANALYST),
  validate(idSchema, 'params'),
  validate(updateApprovalSchema),
  expenseController.updateApprovalStatus
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(idSchema, 'params'),
  expenseController.deleteExpense
);

module.exports = router;
