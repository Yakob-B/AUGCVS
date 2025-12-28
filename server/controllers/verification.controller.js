const Verification = require('../models/verification.model');
const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');
const logAudit = require('../utils/auditLog');

// Helper function to emit socket events
const emitVerificationUpdate = (req, event, data) => {
    const io = req.app.get('io');
    if (io) {
        // Emit to the specific user who made the request
        io.to(`user-${data.requester}`).emit(event, data);

        // Emit to registrar room for new requests
        if (event === 'verification-created') {
            io.to('registrar-room').emit('new-verification-request', data);
        }
    }
};

// @desc    Create verification request
// @route   POST /api/verifications
// @access  Private (External)
exports.createVerification = async (req, res) => {
    // Debug logging
    console.log('--- Incoming Verification Request ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            await logAudit({
                user: req.user.id,
                action: 'create_verification_failed',
                details: { errors: errors.array() },
                ip: req.ip
            });
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Check if file was uploaded
        if (!req.file) {
            console.log('No file uploaded!');
            await logAudit({
                user: req.user.id,
                action: 'create_verification_failed',
                details: { reason: 'No certificate file uploaded' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                errors: [{ msg: 'Please upload a certificate file', param: 'certificateFile' }]
            });
        }

        // Lookup graduate by studentId, fullName, graduationYear, degreeType
        // Lookup graduate by studentId first (most reliable identifier)
        const { studentId, fullName, graduationYear, degreeType } = req.body;

        // Find graduate by student ID (case-insensitive)
        const graduate = await Graduate.findOne({
            studentId: { $regex: new RegExp(`^${studentId}$`, 'i') }
        });

        if (!graduate) {
            console.log(`❌ Graduate NOT FOUND for Student ID: ${studentId}`);

            // DEBUG: Print all student IDs to see what's in there
            try {
                const allGrads = await Graduate.find({}, 'studentId');
                console.log('DEBUG: Existing Student IDs in DB:', allGrads.map(g => g.studentId));
            } catch (e) {
                console.error('Debug query failed', e);
            }

            await logAudit({
                user: req.user.id,
                action: 'create_verification_failed',
                details: { reason: 'Graduate not found', studentId },
                ip: req.ip
            });
            return res.status(404).json({
                success: false,
                errors: [{ msg: 'Graduate not found with provided Student ID', param: 'studentId' }]
            });
        }

        // Validate other details
        const mismatchErrors = [];

        console.log('--- VERIFICATION DEBUG ---');
        console.log('DB Graduate:', JSON.stringify(graduate, null, 2));
        console.log('Input Body:', JSON.stringify(req.body, null, 2));

        // Validate Graduation Year
        if (graduate.graduationYear != graduationYear) {
            console.log(`❌ YEAR MISMATCH: DB=${graduate.graduationYear} Input=${graduationYear}`);
            mismatchErrors.push({ msg: `Graduation year mismatch. Expected: ${graduate.graduationYear}`, param: 'graduationYear' });
        }

        // Validate Degree Type (case-insensitive partial match)
        if (!graduate.degreeType.toLowerCase().includes(degreeType.toLowerCase()) &&
            !degreeType.toLowerCase().includes(graduate.degreeType.toLowerCase())) {
            mismatchErrors.push({ msg: `Degree type mismatch. Expected: ${graduate.degreeType}`, param: 'degreeType' });
        }

        // Validate Name (Loose matching)
        if (fullName) {
            const normalizedInputName = fullName.toLowerCase().replace(/\s+/g, ' ').trim();
            const dbFullName = `${graduate.firstName} ${graduate.middleName ? graduate.middleName + ' ' : ''}${graduate.lastName}`.toLowerCase().replace(/\s+/g, ' ').trim();

            // Check if input name matches DB name loosely
            // 1. Exact match of full string
            // 2. Input contains First + Last
            // 3. DB contains Input

            const nameParts = normalizedInputName.split(' ');
            const inputFirst = nameParts[0];
            const inputLast = nameParts[nameParts.length - 1];

            const dbFirst = graduate.firstName.toLowerCase();
            const dbLast = graduate.lastName.toLowerCase();

            // Basic check: First and Last names must be present in the respective strings
            if (!dbFullName.includes(inputFirst) || !dbFullName.includes(inputLast)) {
                // Fallback: Check strictly if first and last match exactly
                if (inputFirst !== dbFirst || !dbFullName.includes(inputLast)) {
                    mismatchErrors.push({ msg: `Name mismatch. found: ${graduate.firstName} ${graduate.lastName}`, param: 'fullName' });
                }
            }
        }

        if (mismatchErrors.length > 0) {
            await logAudit({
                user: req.user.id,
                action: 'create_verification_failed',
                details: { reason: 'Details mismatch', errors: mismatchErrors },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                errors: mismatchErrors
            });
        }

        // Prepare verification data
        const verificationData = {
            requester: req.user.id,
            graduate: graduate._id,
            certificateNumber: graduate.certificateNumber,
            certificateFile: req.file.path // Cloudinary URL
        };

        const verification = new Verification(verificationData);
        await verification.save();

        // Emit real-time notification
        emitVerificationUpdate(req, 'verification-created', {
            id: verification._id,
            requestNumber: verification.requestNumber,
            status: verification.status,
            requester: verification.requester
        });

        await logAudit({
            user: req.user.id,
            action: 'create_verification_success',
            details: { verificationId: verification._id, graduate: verification.graduate },
            ip: req.ip
        });
        res.status(201).json({
            success: true,
            data: verification
        });
    } catch (err) {
        console.error(err);
        await logAudit({
            user: req.user.id,
            action: 'create_verification_failed',
            details: { error: err.message },
            ip: req.ip
        });
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                errors: [{ msg: err.message, error: err }]
            });
        }
        res.status(500).json({
            success: false,
            errors: [{ msg: 'Server error', error: err.message }]
        });
    }
};

// @desc    Get all verification requests with pagination
// @route   GET /api/verifications
// @access  Private (Admin, Registrar)
exports.getVerifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const query = status ? { status } : {};

        const verifications = await Verification.find(query)
            .populate('requester', 'firstName lastName email organization')
            .populate('graduate', 'firstName lastName studentId certificateNumber')
            .populate('processedBy', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Verification.countDocuments(query);

        res.status(200).json({
            success: true,
            count: verifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
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
        if (req.user.role === 'external' && verification.requester._id.toString() !== req.user.id) {
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

        let verification = await Verification.findById(req.params.id)
            .populate('requester', 'firstName lastName email organization');

        if (!verification) {
            await logAudit({
                user: req.user.id,
                action: 'process_verification_failed',
                details: { verificationId: req.params.id, reason: 'Not found' },
                ip: req.ip
            });
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
        await logAudit({
            user: req.user.id,
            action: 'process_verification_success',
            details: { verificationId: verification._id, status, verificationResult },
            ip: req.ip
        });

        // Send email notification
        const message = `Your verification request (${verification.requestNumber}) has been processed.\n\nStatus: ${status}\nResult: ${verificationResult}\nComments: ${comments}`;
        try {
            await sendEmail({
                email: verification.requester.email,
                subject: 'Verification Request Processed',
                message
            });
        } catch (e) {
            console.error('Email send failed:', e.message);
        }

        // Emit real-time notification to user
        emitVerificationUpdate(req, 'verification-processed', {
            id: verification._id,
            requestNumber: verification.requestNumber,
            status: verification.status,
            verificationResult: verification.verificationResult,
            comments: verification.comments,
            processedAt: verification.processedAt
        });

        res.status(200).json({
            success: true,
            data: verification
        });
    } catch (err) {
        console.error(err);
        await logAudit({
            user: req.user.id,
            action: 'process_verification_failed',
            details: { verificationId: req.params.id, error: err.message },
            ip: req.ip
        });
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's verification requests with pagination
// @route   GET /api/verifications/my-requests
// @access  Private (External)
exports.getMyVerifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const verifications = await Verification.find({ requester: req.user.id })
            .populate('graduate', 'firstName lastName studentId certificateNumber')
            .populate('processedBy', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Verification.countDocuments({ requester: req.user.id });

        res.status(200).json({
            success: true,
            count: verifications.length,
            total,
            page,
            pages: Math.ceil(total / limit),
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