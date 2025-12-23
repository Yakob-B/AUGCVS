const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');

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

// @desc    Bulk upload graduates
exports.bulkUploadGraduates = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const filePath = req.file.path;
        const graduates = [];
        const errors = [];
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if (fileExt === '.csv') {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => graduates.push(data))
                    .on('error', (err) => reject(err))
                    .on('end', () => resolve());
            });
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            graduates.push(...jsonData);
        }

        // Processing results
        let successCount = 0;
        let failCount = 0;
        const results = [];

        for (let i = 0; i < graduates.length; i++) {
            const gradData = graduates[i];

            // Map fields and validate
            try {
                // Ensure field names are consistent (handle potential variations in header names)
                const mappedData = {
                    studentId: gradData['Student ID'] || gradData['studentId'] || gradData['student_id'],
                    firstName: gradData['First Name'] || gradData['firstName'] || gradData['first_name'],
                    lastName: gradData['Last Name'] || gradData['lastName'] || gradData['last_name'],
                    middleName: gradData['Middle Name'] || gradData['middleName'] || gradData['middle_name'],
                    dateOfBirth: gradData['Date of Birth'] || gradData['dateOfBirth'] || gradData['dob'],
                    gender: (gradData['Gender'] || gradData['gender'] || '').toLowerCase(),
                    program: gradData['Program'] || gradData['program'],
                    department: gradData['Department'] || gradData['department'],
                    college: gradData['College'] || gradData['college'],
                    graduationYear: gradData['Graduation Year'] || gradData['graduationYear'] || gradData['year'],
                    graduationDate: gradData['Graduation Date'] || gradData['graduationDate'],
                    degreeType: gradData['Degree Type'] || gradData['degreeType'],
                    gpa: gradData['GPA'] || gradData['gpa'],
                    certificateNumber: gradData['Certificate Number'] || gradData['certificateNumber'],
                    addedBy: req.user.id
                };

                // Basic validation for required fields
                const requiredFields = ['studentId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'program', 'department', 'college', 'graduationYear', 'graduationDate', 'degreeType', 'gpa', 'certificateNumber'];
                const missingFields = requiredFields.filter(f => !mappedData[f]);

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                // Check for existing studentId or certificateNumber
                const existing = await Graduate.findOne({
                    $or: [
                        { studentId: mappedData.studentId },
                        { certificateNumber: mappedData.certificateNumber }
                    ]
                });

                if (existing) {
                    throw new Error(`Student ID ${mappedData.studentId} or Certificate ${mappedData.certificateNumber} already exists`);
                }

                await Graduate.create(mappedData);
                successCount++;
                results.push({ row: i + 1, status: 'success', studentId: mappedData.studentId });
            } catch (err) {
                failCount++;
                results.push({ row: i + 1, status: 'failed', error: err.message });
            }
        }

        // Clean up temporary file
        fs.unlinkSync(filePath);

        await logAudit({
            user: req.user.id,
            action: 'bulk_upload_graduates',
            details: { successCount, failCount, total: graduates.length },
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            summary: {
                total: graduates.length,
                success: successCount,
                failed: failCount
            },
            results
        });
    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
