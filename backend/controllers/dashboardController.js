// TODO: implement by Deepika

const getStats = async (req, res, next) => {
  try {
    // TODO: implement
    res.status(200).json({ success: true, message: 'getStats not implemented yet' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
