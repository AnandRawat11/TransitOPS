// TODO: implement by Deepika

const getDrivers = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getDrivers not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createDriver = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createDriver not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrivers,
  createDriver,
};
