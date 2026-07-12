// TODO: implement by Saurav Shandilya

const getReports = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getReports not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
};
