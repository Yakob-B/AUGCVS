const express = require('express');
const { check } = require('express-validator');
const { getUsers, addUser, deleteUser, updateUser, getUser, toggleUserStatus } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, authorize('admin', 'superadmin'));

// List users
router.get('/', getUsers);

// Get single user
router.get('/:id', getUser);

// Toggle status
router.patch('/:id/toggle-status', toggleUserStatus);

// Add user
router.post(
  '/',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['admin', 'registrar', 'external', 'superadmin']),
    check('organization', 'Organization is required for external users').if(
      (req) => req.body.role === 'external'
    ).not().isEmpty()
  ],
  addUser
);

// Delete user
router.delete('/:id', deleteUser);

// Update user
router.put('/:id', updateUser);

module.exports = router; 