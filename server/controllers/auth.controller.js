const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
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
            role: 'external', // Force role to external for public registration
            organization,
            verificationToken
        });

        await logAudit({
            user: user._id,
            action: 'register_success',
            details: { email, role },
            ip: req.ip
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;

        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify Your Email Address</h2>
                <p>Hello ${user.firstName},</p>
                <p>Thank you for registering with Ambo University Credential Verification System.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #eab308; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
                <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your Email - AUGCVS',
                html: htmlMessage,
                message: `Please verify your email by clicking on this link: ${verificationUrl}`
            });
        } catch (error) {
            console.error('Email sending failed:', error);
            // Continue even if email fails - user can still use the app
        }

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
            await logAudit({
                action: 'email_verification_failed',
                details: { reason: 'Invalid token' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: 'Email already verified'
            });
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        await logAudit({
            user: user._id,
            action: 'email_verified',
            details: { email: user.email },
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (err) {
        console.error(err);
        await logAudit({
            action: 'email_verification_failed',
            details: { error: err.message },
            ip: req.ip
        });
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

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a password reset link has been sent'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hello ${user.firstName},</p>
                <p>You requested to reset your password for your AUGCVS account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #eab308; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 10 minutes.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - AUGCVS',
                html: htmlMessage,
                message: `You requested a password reset. Click this link: ${resetUrl}`
            });

            await logAudit({
                user: user._id,
                action: 'password_reset_requested',
                details: { email },
                ip: req.ip
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (error) {
            console.error('Email sending failed:', error);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            await logAudit({
                user: user._id,
                action: 'password_reset_failed',
                details: { email, reason: 'Email sending failed' },
                ip: req.ip
            });

            res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            await logAudit({
                action: 'password_reset_failed',
                details: { reason: 'Invalid or expired token' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        await logAudit({
            user: user._id,
            action: 'password_reset_success',
            details: { email: user.email },
            ip: req.ip
        });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        await logAudit({
            action: 'password_reset_failed',
            details: { error: err.message },
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verificationUrl = `${clientUrl}/verify-email/${verificationToken}`;

        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Verify Your Email Address</h2>
                <p>Hello ${user.firstName},</p>
                <p>You requested a new verification email.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #eab308; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify Your Email - AUGCVS',
                html: htmlMessage,
                message: `Please verify your email by clicking on this link: ${verificationUrl}`
            });

            res.status(200).json({
                success: true,
                message: 'Verification email sent'
            });
        } catch (error) {
            console.error('Email sending failed:', error);
            res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ✅ FIXED: Helper to send token and user info
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
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            organization: user.organization
        }
    });
};

// @desc    Create internal user (admin/registrar)
// @route   POST /api/auth/superadmin/create-user
// @access  Private (Superadmin only)
exports.createInternalUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, role } = req.body;

        // Ensure only admin or registrar roles can be created
        if (!['admin', 'registrar'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Allowed roles: admin, registrar'
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user with verified email since created by superadmin
        user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role,
            isEmailVerified: true
        });

        await logAudit({
            user: req.user.id,
            action: 'internal_user_created',
            details: {
                createdUserEmail: email,
                createdUserRole: role
            },
            ip: req.ip
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
