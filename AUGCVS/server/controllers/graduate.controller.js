const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');

// @desc    Create new graduate
// @route   POST /api/graduates
// @access  Private (Admin, Registrar)
exports.createGraduate = async (req, res) => {
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

        // Add user and file path to req.body
        req.body.addedBy = req.user.id;
        req.body.certificateFile = `/uploads/${req.file.filename}`;

        const graduate = await Graduate.create(req.body);

        res.status(201).json({
            success: true,
            data: graduate
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all graduates
// @route   GET /api/graduates
// @access  Private (Admin, Registrar)
exports.getGraduates = async (req, res) => {
    try {
        const graduates = await Graduate.find()
            .populate('addedBy', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: graduates.length,
            data: graduates
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single graduate
// @route   GET /api/graduates/:id
// @access  Private (Admin, Registrar)
exports.getGraduate = async (req, res) => {
    try {
        const graduate = await Graduate.findById(req.params.id)
            .populate('addedBy', 'firstName lastName email');

        if (!graduate) {
            return res.status(404).json({
                success: false,
                message: 'Graduate not found'
            });
        }

        res.status(200).json({
            success: true,
            data: graduate
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update graduate
// @route   PUT /api/graduates/:id
// @access  Private (Admin, Registrar)
exports.updateGraduate = async (req, res) => {
    try {
        let graduate = await Graduate.findById(req.params.id);

        if (!graduate) {
            return res.status(404).json({
                success: false,
                message: 'Graduate not found'
            });
        }

        // If new file is uploaded, update the file path
        if (req.file) {
            req.body.certificateFile = `/uploads/${req.file.filename}`;
        }

        graduate = await Graduate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: graduate
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete graduate
// @route   DELETE /api/graduates/:id
// @access  Private (Admin)
exports.deleteGraduate = async (req, res) => {
    try {
        const graduate = await Graduate.findById(req.params.id);

        if (!graduate) {
            return res.status(404).json({
                success: false,
                message: 'Graduate not found'
            });
        }

        await graduate.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Search graduates
// @route   GET /api/graduates/search
// @access  Private (Admin, Registrar)
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
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 