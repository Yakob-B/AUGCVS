const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');

// List all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
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
    await user.remove();
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
    const user = await User.findById(req.params.id);
    if (!user) {
      await logAudit({
        user: req.user.id,
        action: 'update_user_failed',
        details: { userId: req.params.id, reason: 'Not found' },
        ip: req.ip
      });
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { firstName, lastName, email, role, organization } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.organization = organization || user.organization;
    await user.save();
    await logAudit({
      user: req.user.id,
      action: 'update_user_success',
      details: { userId: user._id, email: user.email },
      ip: req.ip
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    await logAudit({
      user: req.user.id,
      action: 'update_user_failed',
      details: { userId: req.params.id, error: err.message },
      ip: req.ip
    });
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 