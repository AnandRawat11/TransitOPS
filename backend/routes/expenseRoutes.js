const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// GET / - list all
router.get('/', expenseController.getExpenses);

// GET /:id - get expense by id
router.get('/:id', expenseController.getExpenseById);

// POST / - create
router.post('/', expenseController.createExpense);

// PUT /:id - update expense
router.put('/:id', expenseController.updateExpense);

// DELETE /:id - delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
