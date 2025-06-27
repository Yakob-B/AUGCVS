const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail'); // ⛔ Temporarily disabled
const logAudit = require('../utils/auditLog');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await logAudit({
                action: 'register_failed',
                details: { errors: errors.array() },
                ip: req.ip
            });
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, role, organization } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            await logAudit({
                action: 'register_failed',
                details: { email, reason: 'User already exists' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
            organization,
            verificationToken
        });

        await logAudit({
            user: user._id,
            action: 'register_success',
            details: { email, role },
            ip: req.ip
        });

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on this link: \n\n ${verificationUrl}`;

        // ⛔ Email sending skipped for development
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Email Verification',
        //     message
        // });
        console.log('⛔ Skipped sending email (dev mode):', user.email);

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        await logAudit({
            action: 'register_failed',
            details: { email: req.body?.email, error: err.message },
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            await logAudit({
                action: 'login_failed',
                details: { email, reason: 'Missing email or password' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            await logAudit({
                action: 'login_failed',
                details: { email, reason: 'User not found' },
                ip: req.ip
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            await logAudit({
                user: user._id,
                action: 'login_failed',
                details: { email, reason: 'Incorrect password' },
                ip: req.ip
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        await logAudit({
            user: user._id,
            action: 'login_success',
            details: { email },
            ip: req.ip
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        await logAudit({
            action: 'login_failed',
            details: { email: req.body?.email, reason: err.message },
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
};
