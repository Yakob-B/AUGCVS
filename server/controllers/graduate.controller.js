const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');
const mongoose = require('mongoose');

// @desc    Create new graduate
exports.createGraduate = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Graduate validation failed:', errors.array());
            await logAudit({
                user: req.user.id,
                action: 'create_graduate_failed',
                details: { errors: errors.array() },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        if (!req.file) {
            console.error('Graduate creation failed: No certificate file uploaded');
            await logAudit({
                user: req.user.id,
                action: 'create_graduate_failed',
                details: { reason: 'No certificate file uploaded' },
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Please upload a certificate file'
            });
        }

        req.body.addedBy = req.user.id;
        req.body.certificateFile = req.file.path; // Cloudinary URL

        const graduate = await Graduate.create(req.body);
        await logAudit({
            user: req.user.id,
            action: 'create_graduate_success',
            details: { graduateId: graduate._id, studentId: graduate.studentId },
            ip: req.ip
        });
        res.status(201).json({ success: true, data: graduate });
    } catch (err) {
        console.error(err);
        await logAudit({
            user: req.user.id,
            action: 'create_graduate_failed',
            details: { error: err.message },
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all graduates with pagination
exports.getGraduates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const graduates = await Graduate.find()
            .populate('addedBy', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Graduate.countDocuments();

        res.status(200).json({
            success: true,
            count: graduates.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: graduates
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single graduate
exports.getGraduate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid graduate ID'
            });
        }

        const graduate = await Graduate.findById(id)
            .populate('addedBy', 'firstName lastName email');

        if (!graduate) {
            return res.status(404).json({
                success: false,
                message: 'Graduate not found'
            });
        }

        res.status(200).json({ success: true, data: graduate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update graduate
exports.updateGraduate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid graduate ID'
            });
        }

        let graduate = await Graduate.findById(id);

        if (!graduate) {
            await logAudit({
                user: req.user.id,
                action: 'update_graduate_failed',
                details: { graduateId: id, reason: 'Not found' },
                ip: req.ip
            });
            return res.status(404).json({ success: false, message: 'Graduate not found' });
        }

        if (req.file) {
            req.body.certificateFile = req.file.path; // Cloudinary URL
        }

        graduate = await Graduate.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        await logAudit({
            user: req.user.id,
            action: 'update_graduate_success',
            details: { graduateId: graduate._id },
            ip: req.ip
        });

        res.status(200).json({ success: true, data: graduate });
    } catch (err) {
        console.error(err);
        await logAudit({
            user: req.user.id,
            action: 'update_graduate_failed',
            details: { graduateId: req.params.id, error: err.message },
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete graduate
exports.deleteGraduate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid graduate ID'
            });
        }

        const graduate = await Graduate.findById(id);

        if (!graduate) {
            await logAudit({
                user: req.user.id,
                action: 'delete_graduate_failed',
                details: { graduateId: id, reason: 'Not found' },
                ip: req.ip
            });
            return res.status(404).json({ success: false, message: 'Graduate not found' });
        }

        await Graduate.deleteOne({ _id: graduate._id });

        await logAudit({
            user: req.user.id,
            action: 'delete_graduate_success',
            details: { graduateId: graduate._id, studentId: graduate.studentId },
            ip: req.ip
        });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        await logAudit({
            user: req.user.id,
            action: 'delete_graduate_failed',
            details: { graduateId: req.params.id, error: err.message },
            ip: req.ip
        });
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Search graduates
exports.searchGraduates = async (req, res) => {
    try {
        const { query } = req.query;

        const graduates = await Graduate.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { studentId: { $regex: query, $options: 'i' } },
                { certificateNumber: { $regex: query, $options: 'i' } }
            ]
        }).populate('addedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: graduates.length,
            data: graduates
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get filter options
exports.getFilters = async (req, res) => {
    try {
        const departments = await Graduate.distinct('department');
        const years = (await Graduate.distinct('graduationYear')).sort((a, b) => b - a);
        res.status(200).json({ departments, years });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch filter options' });
    }
};
