const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// GET / - list all - Saurav Shandilya to implement
router.get('/', expenseController.getExpenses);

// POST / - create - Saurav Shandilya to implement
router.post('/', expenseController.createExpense);

module.exports = router;
