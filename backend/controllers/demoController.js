const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');
const eventBus = require('../utils/eventBus');

exports.seedDemoData = catchAsync(async (req, res) => {
  // Clear existing demo data if needed, or just insert new
  const vehicles = [
    { registrationNumber: 'DEMO-V1', vehicleName: 'Demo Truck 1', vehicleType: 'TRUCK', manufacturer: 'Volvo', model: 'VNL', year: 2024, fuelType: 'DIESEL', currentStatus: 'AVAILABLE' },
    { registrationNumber: 'DEMO-V2', vehicleName: 'Demo Van 2', vehicleType: 'VAN', manufacturer: 'Ford', model: 'Transit', year: 2023, fuelType: 'ELECTRIC', currentStatus: 'ON_TRIP' }
  ];

  await Vehicle.insertMany(vehicles.map(v => ({...v, createdBy: req.user.id})));

  // Generate some fake AI notifications
  eventBus.emit('AI_ALERT', {
    userId: req.user.id,
    title: 'High Risk Prediction',
    message: 'AI predicts DEMO-V1 has an 85% chance of brake failure in the next 400 miles.'
  });
  
  eventBus.emit('AI_ALERT', {
    userId: req.user.id,
    title: 'Route Optimization',
    message: 'Traffic anomaly detected. Rerouting DEMO-V2 saves 14 mins.'
  });

  sendSuccess(res, 200, 'Demo data successfully injected into the system');
});

exports.resetDemoData = catchAsync(async (req, res) => {
  await Vehicle.deleteMany({ registrationNumber: { $regex: '^DEMO-' } });
  sendSuccess(res, 200, 'Demo data wiped');
});
