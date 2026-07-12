/**
 * admin.service.js
 * Handles lightweight administration logic like User Management.
 */
const User = require('../models/User');

exports.getUsers = async (query = {}) => {
  const { role, status, search } = query;
  
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  return users;
};

exports.updateUserRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) throw new Error('User not found');
  return user;
};

exports.toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.isActive = !user.isActive;
  await user.save();
  return user;
};
