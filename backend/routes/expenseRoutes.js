const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes are private
router.use(authMiddleware);

// GET / - list expenses (all roles)
router.get('/', expenseController.getExpenses);

// GET /:id - get expense by id
router.get('/:id', expenseController.getExpenseById);

// POST / - create expense (FleetManager / FinancialAnalyst)
router.post('/', roleMiddleware('FleetManager', 'FinancialAnalyst'), expenseController.createExpense);

// PUT /:id - update expense (FleetManager only)
router.put('/:id', roleMiddleware('FleetManager'), expenseController.updateExpense);

// DELETE /:id - delete expense (FleetManager only)
router.delete('/:id', roleMiddleware('FleetManager'), expenseController.deleteExpense);

module.exports = router;
