/**
 * maintenance.service.js - Core business logic for Maintenance Module.
 */
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const vehicleService = require('./vehicle.service');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');

const generateMaintenanceNumber = async () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await Maintenance.countDocuments({ maintenanceNumber: new RegExp(`^MNT-${date}`) });
  const seq = String(count + 1).padStart(4, '0');
  return `MNT-${date}-${seq}`;
};

const validateTechnician = async (technicianId) => {
  if (!technicianId) return;

  const tech = await User.findById(technicianId);
  if (!tech) throw new AppError('Assigned technician not found', 404);
  if (tech.role !== ROLES.TECHNICIAN && tech.role !== ROLES.FLEET_MANAGER) {
    throw new AppError(`Assigned user must be a ${ROLES.TECHNICIAN} or ${ROLES.FLEET_MANAGER}`, 400);
  }
  if (!tech.isActive) throw new AppError('Assigned technician is not active', 400);
};

const validateVehicleForMaintenance = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  if (!vehicle.isActive) throw new AppError('Vehicle is not active', 400);
  return vehicle;
};

const createMaintenance = async (data, creatorId) => {
  if (!data.maintenanceNumber) {
    data.maintenanceNumber = await generateMaintenanceNumber();
  }

  await validateVehicleForMaintenance(data.vehicleId);
  if (data.assignedTechnician) await validateTechnician(data.assignedTechnician);

  let initialStatus = 'REPORTED';
  if (data.scheduledDate) initialStatus = 'SCHEDULED';

  const mntData = {
    ...data,
    status: initialStatus,
    statusHistory: [{ status: initialStatus, notes: 'Maintenance logged' }],
    reportedBy: creatorId,
    createdBy: creatorId
  };

  const maintenance = await Maintenance.create(mntData);
  return maintenance;
};

const getAllMaintenance = async (query) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.maintenanceType) filter.maintenanceType = query.maintenanceType;
  if (query.vehicleId) filter.vehicleId = query.vehicleId;
  if (query.assignedTechnician) filter.assignedTechnician = query.assignedTechnician;

  if (query.search) {
    filter.$or = [
      { maintenanceNumber: new RegExp(query.search, 'i') },
      { title: new RegExp(query.search, 'i') }
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (query.sortBy) {
    sort = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  }

  const [data, total] = await Promise.all([
    Maintenance.find(filter)
      .populate('vehicleId', 'registrationNumber vehicleName currentStatus')
      .populate('assignedTechnician', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Maintenance.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getMaintenanceById = async (id) => {
  const mnt = await Maintenance.findById(id)
    .populate('vehicleId', 'registrationNumber vehicleName currentStatus make model year')
    .populate('assignedTechnician', 'name email phone')
    .populate('reportedBy', 'name')
    .populate('createdBy', 'name');

  if (!mnt) throw new AppError('Maintenance record not found', 404);
  return mnt;
};

const getMaintenanceByVehicleId = async (vehicleId) => {
  return Maintenance.find({ vehicleId }).sort({ createdAt: -1 }).populate('assignedTechnician', 'name');
};

const getUpcomingMaintenance = async () => {
  // SCHEDULED and date is in future
  return Maintenance.find({
    status: 'SCHEDULED',
    scheduledDate: { $gte: new Date() }
  }).sort({ scheduledDate: 1 }).populate('vehicleId', 'registrationNumber vehicleName');
};

const getOverdueMaintenance = async () => {
  // SCHEDULED and date is in past
  return Maintenance.find({
    status: 'SCHEDULED',
    scheduledDate: { $lt: new Date() }
  }).sort({ scheduledDate: 1 }).populate('vehicleId', 'registrationNumber vehicleName');
};

const updateMaintenance = async (id, data, updaterId) => {
  const mnt = await Maintenance.findById(id);
  if (!mnt) throw new AppError('Maintenance record not found', 404);

  if (data.status) delete data.status; // handled by updateStatus

  if (data.assignedTechnician && data.assignedTechnician !== mnt.assignedTechnician?.toString()) {
    await validateTechnician(data.assignedTechnician);
  }

  // Calculate actual cost dynamically if parts are provided and actualCost is missing
  if (data.partsReplaced && !data.actualCost) {
    data.actualCost = data.partsReplaced.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
  }

  const updatedMnt = await Maintenance.findByIdAndUpdate(
    id,
    { ...data, updatedBy: updaterId },
    { new: true, runValidators: true }
  ).populate('vehicleId').populate('assignedTechnician');

  return updatedMnt;
};

const updateMaintenanceStatus = async (id, newStatus, notes, updaterId) => {
  const mnt = await Maintenance.findById(id);
  if (!mnt) throw new AppError('Maintenance record not found', 404);

  const currentStatus = mnt.status;
  const validTransitions = {
    REPORTED: ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
    SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new AppError(`Invalid status transition from ${currentStatus} to ${newStatus}`, 400);
  }

  // Vehicle sync logic based on Phase 4 design
  const vehicle = await Vehicle.findById(mnt.vehicleId);

  if (newStatus === 'IN_PROGRESS') {
    // If vehicle is ON_TRIP, it cannot be put into MAINTENANCE (Wait, actually if they try to start maintenance while on trip, fail)
    if (vehicle.currentStatus === 'ON_TRIP') {
      throw new AppError('Cannot start maintenance. Vehicle is currently ON_TRIP.', 400);
    }
    mnt.startedAt = new Date();
    await vehicleService.updateVehicleStatus(vehicle._id, 'MAINTENANCE');
  }

  if (newStatus === 'COMPLETED') {
    mnt.completedAt = new Date();
    // Return vehicle to AVAILABLE
    await vehicleService.updateVehicleStatus(vehicle._id, 'AVAILABLE');
    
    // Optionally sync odometer if provided during completion
    if (mnt.odometerReading && mnt.odometerReading > vehicle.odometer) {
      await vehicleService.updateVehicle(vehicle._id, { odometer: mnt.odometerReading });
    }
  }

  if (newStatus === 'CANCELLED' && currentStatus === 'IN_PROGRESS') {
    // Revert vehicle to AVAILABLE if it was in maintenance
    await vehicleService.updateVehicleStatus(vehicle._id, 'AVAILABLE');
  }

  mnt.status = newStatus;
  mnt.statusHistory.push({ status: newStatus, notes, changedAt: new Date() });
  mnt.updatedBy = updaterId;

  await mnt.save();
  return mnt;
};

const deleteMaintenance = async (id) => {
  const mnt = await Maintenance.findById(id);
  if (!mnt) throw new AppError('Maintenance record not found', 404);

  if (mnt.status === 'IN_PROGRESS') {
    throw new AppError('Cannot delete an active maintenance job. Cancel it first.', 400);
  }

  await Maintenance.findByIdAndDelete(id);
};

// Dashboard Analytics
const getDashboardSummary = async () => {
  const stats = await Maintenance.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ $and: [ { $eq: ['$status', 'SCHEDULED'] }, { $lt: ['$scheduledDate', new Date()] } ] }, 1, 0] } },
        totalCost: { $sum: { $ifNull: ['$actualCost', 0] } },
        avgRepairTimeMs: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'COMPLETED'] },
              { $subtract: ['$completedAt', '$startedAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  if (stats.length === 0) return { total: 0, active: 0, completed: 0, overdue: 0, totalCost: 0, avgRepairTimeHours: 0, fleetDowntime: 0 };

  const summary = stats[0];
  delete summary._id;
  summary.avgRepairTimeHours = summary.avgRepairTimeMs ? Math.round(summary.avgRepairTimeMs / (1000 * 60 * 60) * 10) / 10 : 0;
  delete summary.avgRepairTimeMs;

  const totalVehicles = await Vehicle.countDocuments({ isActive: true });
  const maintenanceVehicles = await Vehicle.countDocuments({ currentStatus: 'MAINTENANCE', isActive: true });
  summary.fleetDowntime = totalVehicles > 0 ? Math.round((maintenanceVehicles / totalVehicles) * 100) : 0;

  return summary;
};

const getDashboardAnalytics = async () => {
  const analytics = await Maintenance.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$maintenanceType', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        monthlyCostTrends: [
          { $match: { status: 'COMPLETED' } },
          {
            $group: {
              _id: {
                year: { $year: '$completedAt' },
                month: { $month: '$completedAt' }
              },
              cost: { $sum: '$actualCost' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedTrends = analytics[0].monthlyCostTrends.map(t => ({
    name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    cost: Math.round(t.cost)
  }));

  return {
    byType: analytics[0].byType.map(t => ({ name: t._id, value: t.count })),
    byPriority: analytics[0].byPriority.map(t => ({ name: t._id, value: t.count })),
    costTrends: formattedTrends
  };
};

module.exports = {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  getMaintenanceByVehicleId,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  getDashboardSummary,
  getDashboardAnalytics
};
