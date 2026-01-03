const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');

// List all users with search
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { organization: { $regex: search, $options: 'i' } }
        ]
      };
      console.log(`Searching users with query: [${search}]`);
    }

    const users = await User.find(query).select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total
      },
      data: users
    });
  } catch (err) {
    console.error(`Error in getUsers: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await logAudit({
        user: req.user.id,
        action: 'add_user_failed',
        details: { errors: errors.array() },
        ip: req.ip
      });
      return res.status(400).json({ errors: errors.array() });
    }
    const { firstName, lastName, email, password, role, organization } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      await logAudit({
        user: req.user.id,
        action: 'add_user_failed',
        details: { email, reason: 'User already exists' },
        ip: req.ip
      });
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    user = await User.create({ firstName, lastName, email, password, role, organization });
    await logAudit({
      user: req.user.id,
      action: 'add_user_success',
      details: { userId: user._id, email },
      ip: req.ip
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    await logAudit({
      user: req.user.id,
      action: 'add_user_failed',
      details: { error: err.message },
      ip: req.ip
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      await logAudit({
        user: req.user.id,
        action: 'delete_user_failed',
        details: { userId: req.params.id, reason: 'Not found' },
        ip: req.ip
      });
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.deleteOne({ _id: user._id });
    await logAudit({
      user: req.user.id,
      action: 'delete_user_success',
      details: { userId: user._id, email: user.email },
      ip: req.ip
    });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    await logAudit({
      user: req.user.id,
      action: 'delete_user_failed',
      details: { userId: req.params.id, error: err.message },
      ip: req.ip
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id ? req.params.id.trim() : null;
    console.log(`Updating user ID: [${userId}] (length: ${userId ? userId.length : 0})`);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found in DB for update: [${userId}]`);
      await logAudit({
        user: req.user.id,
        action: 'update_user_failed',
        details: { userId: userId, reason: 'Not found' },
        ip: req.ip
      });
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { firstName, lastName, email, role, organization, password } = req.body;
    console.log(`Update data:`, { firstName, lastName, email, role, organization });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.organization = organization || user.organization;

    if (password) {
      user.password = password;
    }

    await user.save();
    console.log(`User updated successfully: ${user._id}`);
    await logAudit({
      user: req.user.id,
      action: 'update_user_success',
      details: { userId: user._id, email: user.email },
      ip: req.ip
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(`Error updating user: ${err.message}`);
    await logAudit({
      user: req.user.id,
      action: 'update_user_failed',
      details: { userId: req.params.id, error: err.message },
      ip: req.ip
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id ? req.params.id.trim() : null;
    console.log(`Fetching single user ID: [${userId}] (length: ${userId ? userId.length : 0})`);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log(`User not found in DB: [${userId}]`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log(`User fetched successfully: ${user.email}`);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(`Error fetching user [${req.params.id}]: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Toggle user status (active/deactivated)
exports.toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is trying to deactivate themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Toggle status
    user.status = user.status === 'active' ? 'deactivated' : 'active';
    await user.save();

    await logAudit({
      user: req.user.id,
      action: `user_${user.status}`,
      details: { userId: user._id, email: user.email, status: user.status },
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    console.error(`Error toggling user status: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
