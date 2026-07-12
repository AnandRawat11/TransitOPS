// TODO: implement by Saurav Shandilya

const getExpenses = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getExpenses not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createExpense not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
};
