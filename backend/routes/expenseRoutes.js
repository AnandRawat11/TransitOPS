const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET / - list all
router.get('/', expenseController.getExpenses);

// GET /:id - get expense by id
router.get('/:id', expenseController.getExpenseById);

// POST / - create
router.post('/', expenseController.createExpense);
// All routes are private
router.use(authMiddleware);

// GET / - list expenses (all roles)
router.get('/', expenseController.getExpenses);

// POST / - create expense (FleetManager / FinancialAnalyst)
router.post('/', roleMiddleware(['FleetManager', 'FinancialAnalyst']), expenseController.createExpense);

// DELETE /:id - delete expense (FleetManager only)
router.delete('/:id', roleMiddleware(['FleetManager']), expenseController.deleteExpense);

// PUT /:id - update expense
router.put('/:id', expenseController.updateExpense);

// DELETE /:id - delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
