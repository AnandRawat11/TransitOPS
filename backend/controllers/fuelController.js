// TODO: implement by Saurav Shandilya

const getFuelLogs = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getFuelLogs not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createFuelLog = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createFuelLog not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFuelLogs,
  createFuelLog,
};
