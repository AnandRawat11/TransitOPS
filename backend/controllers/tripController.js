/**
 * tripController.js - Trip endpoints controller.
 */
const tripService = require('../services/trip.service');
const { sendSuccess } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const createTrip = catchAsync(async (req, res) => {
  const trip = await tripService.createTrip(req.body, req.user.id);
  sendSuccess(res, 201, 'Trip created successfully', trip);
});

const getTrips = catchAsync(async (req, res) => {
  const result = await tripService.getAllTrips(req.query);
  res.status(200).json({
    success: true,
    message: 'Trips retrieved successfully',
    data: result.data,
    pagination: result.pagination
  });
});

const getTripById = catchAsync(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);
  sendSuccess(res, 200, 'Trip retrieved successfully', trip);
});

const updateTrip = catchAsync(async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.body, req.user.id);
  sendSuccess(res, 200, 'Trip updated successfully', trip);
});

const updateTripStatus = catchAsync(async (req, res) => {
  const { status, notes } = req.body;
  const trip = await tripService.updateTripStatus(req.params.id, status, notes, req.user.id);
  sendSuccess(res, 200, 'Trip status updated successfully', trip);
});

const deleteTrip = catchAsync(async (req, res) => {
  await tripService.deleteTrip(req.params.id);
  sendSuccess(res, 200, 'Trip deleted successfully');
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  updateTripStatus,
  deleteTrip,
};
