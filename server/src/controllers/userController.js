import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

// @desc    List all users (for admin user-management page)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users: users.map((u) => u.toSafeObject()) });
});

// @desc    Update a user's role (admin / receptionist / patient)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!Object.values(ROLES).includes(role)) {
    res.status(400);
    throw new Error(`Role must be one of: ${Object.values(ROLES).join(', ')}`);
  }

  if (req.params.id === req.user.id.toString() && role !== ROLES.ADMIN) {
    res.status(400);
    throw new Error('You cannot demote yourself from admin.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = role;
  await user.save();

  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Activate / deactivate a user account
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (req.params.id === req.user.id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = Boolean(isActive);
  await user.save();

  res.json({ success: true, user: user.toSafeObject() });
});
