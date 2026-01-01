const express = require('express');
const { check } = require('express-validator');
const {
    register,
    login,
    verifyEmail,
    getMe,
    forgotPassword,
    resetPassword,
    resendVerification,
    createInternalUser
} = require('../controllers/auth.controller');
const { protect, requireSuperAdmin } = require('../middleware/auth.middleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Register route with validation and rate limiting
router.post(
    '/register',
    authLimiter,
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

// Login route with validation and rate limiting
router.post(
    '/login',
    authLimiter,
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

// Verify email route
router.get('/verify-email/:token', verifyEmail);

// Password reset routes with rate limiting
router.post(
    '/forgot-password',
    passwordResetLimiter,
    [check('email', 'Please include a valid email').isEmail()],
    forgotPassword
);

router.put(
    '/reset-password/:resettoken',
    [check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })],
    resetPassword
);

// Resend verification email
router.post('/resend-verification', protect, resendVerification);

// Get current user route
router.get('/me', protect, getMe);

// Superadmin: Create internal user
router.post(
    '/superadmin/create-user',
    [
        protect,
        requireSuperAdmin,
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('role', 'Role is required').isIn(['admin', 'registrar'])
    ],
    createInternalUser
);

module.exports = router;