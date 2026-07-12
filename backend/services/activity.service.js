/**
 * activity.service.js
 * Listens to eventBus and logs Activities.
 * Also provides APIs to fetch activities.
 */
const Activity = require('../models/Activity');
const eventBus = require('../utils/eventBus');

// ──────────────────────────────────────
// EVENT LISTENERS
// ──────────────────────────────────────

eventBus.on('USER_LOGIN', async (data) => {
  try {
    await Activity.create({
      user: data.userId,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User logged in to the system.`,
    });
  } catch (err) {
    console.error('Failed to log Activity: USER_LOGIN', err);
  }
});

eventBus.on('VEHICLE_CREATED', async (data) => {
  try {
    await Activity.create({
      user: data.userId,
      action: 'CREATED',
      module: 'VEHICLES',
      entityType: 'Vehicle',
      entityId: data.vehicleId,
      description: `Added a new vehicle (${data.vehicleNumber}).`,
    });
  } catch (err) {
    console.error('Failed to log Activity: VEHICLE_CREATED', err);
  }
});

// Generic fallbacks for CRUD if we pass standard payloads
eventBus.on('ACTIVITY_LOG', async (data) => {
  try {
    await Activity.create({
      user: data.userId,
      action: data.action,
      module: data.module,
      entityType: data.entityType,
      entityId: data.entityId,
      description: data.description,
      metadata: data.metadata || {},
    });
  } catch (err) {
    console.error('Failed to log Activity: ACTIVITY_LOG', err);
  }
});

// ──────────────────────────────────────
// API METHODS
// ──────────────────────────────────────

exports.getRecentActivities = async (query = {}) => {
  const { module, user, limit = 50 } = query;
  
  const filter = {};
  if (module) filter.module = module;
  if (user) filter.user = user;

  const activities = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('user', 'name role profileImage');
    
  return activities;
};
