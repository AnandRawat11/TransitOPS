// TODO: implement by Nitin Singh

const getMaintenanceLogs = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getMaintenanceLogs not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createMaintenanceLog not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceLogs,
  createMaintenanceLog,
};
