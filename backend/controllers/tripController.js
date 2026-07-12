// TODO: implement by Nitin Singh

const getTrips = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getTrips not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const createTrip = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'createTrip not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  createTrip,
};
