const express = require('express');
const { check } = require('express-validator');
const {
    register,
    login,
    verifyEmail,
    getMe
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Register route with validation
router.post(
    '/register',
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role is required').isIn(['admin', 'registrar', 'external']),
        check('organization', 'Organization is required for external users').if(
            (req) => req.body.role === 'external'
        ).not().isEmpty()
    ],
    register
);

// Login route with validation
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

// Verify email route
router.get('/verify-email/:token', verifyEmail);

// Get current user route
router.get('/me', protect, getMe);

module.exports = router; 