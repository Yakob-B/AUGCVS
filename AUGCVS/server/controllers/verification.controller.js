const Verification = require('../models/verification.model');
const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');

// @desc    Create verification request
// @route   POST /api/verifications
// @access  Private (External)
exports.createVerification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a certificate file'
            });
        }

        // Add requester and file path to req.body
        req.body.requester = req.user.id;
        req.body.certificateFile = `/uploads/${req.file.filename}`;

        const verification = await Verification.create(req.body);

        res.status(201).json({
            success: true,
            data: verification
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all verification requests
// @route   GET /api/verifications
// @access  Private (Admin, Registrar)
exports.getVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find()
            .populate('requester', 'firstName lastName email organization')
            .populate('graduate', 'firstName lastName studentId certificateNumber')
            .populate('processedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: verifications.length,
            data: verifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single verification request
// @route   GET /api/verifications/:id
// @access  Private
exports.getVerification = async (req, res) => {
    try {
        const verification = await Verification.findById(req.params.id)
            .populate('requester', 'firstName lastName email organization')
            .populate('graduate', 'firstName lastName studentId certificateNumber')
            .populate('processedBy', 'firstName lastName email');

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        // Check if user is authorized to view this request
        if (req.user.role === 'external' && verification.requester.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this verification request'
            });
        }

        res.status(200).json({
            success: true,
            data: verification
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Process verification request
// @route   PUT /api/verifications/:id/process
// @access  Private (Registrar)
exports.processVerification = async (req, res) => {
    try {
        const { status, verificationResult, comments } = req.body;

        let verification = await Verification.findById(req.params.id);

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Verification request not found'
            });
        }

        // Update verification
        verification.status = status;
        verification.verificationResult = verificationResult;
        verification.comments = comments;
        verification.processedBy = req.user.id;
        verification.processedAt = Date.now();

        await verification.save();

        // Send email notification
        const message = `Your verification request (${verification.requestNumber}) has been processed.\n\nStatus: ${status}\nResult: ${verificationResult}\nComments: ${comments}`;
        await sendEmail({
            email: verification.requester.email,
            subject: 'Verification Request Processed',
            message
        });

        res.status(200).json({
            success: true,
            data: verification
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's verification requests
// @route   GET /api/verifications/my-requests
// @access  Private (External)
exports.getMyVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find({ requester: req.user.id })
            .populate('graduate', 'firstName lastName studentId certificateNumber')
            .populate('processedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: verifications.length,
            data: verifications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 