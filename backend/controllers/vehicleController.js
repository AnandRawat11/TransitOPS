// TODO: implement by Anand Rawat

const getVehicles = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getVehicles not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getVehicleById not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createVehicle not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'updateVehicle not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'deleteVehicle not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
