const Graduate = require('../models/graduate.model');
const { validationResult } = require('express-validator');
const logAudit = require('../utils/auditLog');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const xlsx = require('xlsx');
const cloudinary = require('../config/cloudinary.config');

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

        if (!query) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        let graduates = [];

        // Strategy 1: Text Search (Best for relevance and full words)
        // Uses the text index we just created
        const textSearchResults = await Graduate.find({
            $text: { $search: query }
        }, {
            score: { $meta: "textScore" }
        })
            .sort({ score: { $meta: "textScore" } })
            .populate('addedBy', 'firstName lastName email')
            .limit(20);

        // Strategy 2: Split Regex Search (Better for partial strings/typos)
        // Splits "Yakob Worku" into ["Yakob", "Worku"] and looks for both
        const terms = query.trim().split(/\s+/);
        const regexConditions = terms.map(term => ({
            $or: [
                { firstName: { $regex: term, $options: 'i' } },
                { lastName: { $regex: term, $options: 'i' } },
                { middleName: { $regex: term, $options: 'i' } },
                { studentId: { $regex: term, $options: 'i' } },
                { certificateNumber: { $regex: term, $options: 'i' } }
            ]
        }));

        const regexSearchResults = await Graduate.find({
            $and: regexConditions
        })
            .populate('addedBy', 'firstName lastName email')
            .limit(20);

        // Merge results, removing duplicates (prefer text search results first)
        const seenIds = new Set();
        graduates = [...textSearchResults];

        textSearchResults.forEach(g => seenIds.add(g._id.toString()));

        regexSearchResults.forEach(g => {
            if (!seenIds.has(g._id.toString())) {
                graduates.push(g);
                seenIds.add(g._id.toString());
            }
        });

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

// Helper function to extract student ID from filename
// Prioritizes student ID format: UGR/12345/16
function extractStudentIdFromFilename(filename) {
    // Remove common separators and normalize
    const normalized = filename.toUpperCase().trim();

    // Pattern 1: UGR-12345-16 or UGR_12345_16 or UGR 12345 16
    const pattern1 = /UGR[-_\s]?(\d+)[-_\s]?(\d+)/;
    const match1 = normalized.match(pattern1);
    if (match1) {
        return `UGR/${match1[1]}/${match1[2]}`;
    }

    // Pattern 2: Just the ID part like 12345-16 or 12345_16
    const pattern2 = /^(\d+)[-_](\d+)/;
    const match2 = normalized.match(pattern2);
    if (match2) {
        return `UGR/${match2[1]}/${match2[2]}`;
    }

    // Pattern 3: Full format UGR/12345/16 already in filename
    const pattern3 = /UGR\/(\d+)\/(\d+)/;
    const match3 = normalized.match(pattern3);
    if (match3) {
        return `UGR/${match3[1]}/${match3[2]}`;
    }

    return null;
}

// @desc    Bulk upload graduates via ZIP (Excel + Certificates)
exports.bulkUploadGraduates = async (req, res) => {
    let zipPath = null;
    let extractionPath = null;

    // Helper to get all files recursively
    const getAllFiles = (dirPath, arrayOfFiles) => {
        const files = fs.readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });
        return arrayOfFiles;
    };

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a ZIP file' });
        }

        zipPath = req.file.path;
        extractionPath = path.join(path.dirname(zipPath), `extracted_${Date.now()}`);

        // 1. Unzip the file
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractionPath, true);

        // 2. Find the Excel file recursively
        const allExtractedFiles = getAllFiles(extractionPath);
        const excelFileFull = allExtractedFiles.find(f => f.match(/\.(xlsx|xls|csv)$/i));

        if (!excelFileFull) {
            throw new Error('No Excel or CSV file found in the ZIP archive');
        }

        // 3. Parse Excel Data
        const workbook = xlsx.readFile(excelFileFull);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            throw new Error('Excel file is empty');
        }

        const stats = {
            total: data.length,
            success: 0,
            failed: 0,
            errors: []
        };

        console.log('--- Bulk Upload Debug ---');
        console.log('Excel file found at:', excelFileFull);
        console.log('Parsed records count:', data.length);
        if (data.length > 0) {
            console.log('First record keys:', Object.keys(data[0]));
        }

        // 4. Process each student
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const studentId = row['Student ID'] || row['studentId'];

            try {
                if (!studentId) throw new Error('Missing Student ID');

                const existing = await Graduate.findOne({ studentId });
                if (existing) throw new Error(`Graduate with ID ${studentId} already exists`);

                // Find Certificate File recursively
                console.log(`Searching certificate for: ${studentId}`);

                const normalizedId = studentId.toLowerCase().replace(/[\/\-_ ]/g, '');
                const idParts = studentId.split(/[\/\-_ ]/).filter(p => p && !isNaN(p));

                const certFileFull = allExtractedFiles.find(f => {
                    if (f === excelFileFull) return false;
                    const isMedia = f.match(/\.(pdf|jpg|jpeg|png)$/i);
                    if (!isMedia) return false;

                    const filename = path.basename(f).toLowerCase();
                    const filenameWithoutExt = filename.split('.').slice(0, -1).join('.');
                    const normalizedFilename = filenameWithoutExt.replace(/[\/\-_ ]/g, '');

                    // Match 1: Normalized exact (ugr123416 === ugr123416)
                    if (normalizedFilename === normalizedId) return true;

                    // Match 2: Contains whole student ID as-is (case insensitive)
                    if (filename.includes(studentId.toLowerCase())) return true;

                    // Match 3: Alphanumeric version replaces slashes with common separators
                    const slugId = studentId.toLowerCase().replace(/\//g, '-');
                    const underscoreId = studentId.toLowerCase().replace(/\//g, '_');
                    if (filename.includes(slugId) || filename.includes(underscoreId)) return true;

                    // Match 4: Every numeric part (strict fallback)
                    if (idParts.length > 0 && idParts.every(part => filename.includes(part))) return true;

                    // Match 5: Filename is exactly one of the significant numeric parts (e.g., "1234.pdf" matches "UGR/1234/16")
                    if (idParts.some(part => part.length >= 3 && filenameWithoutExt === part)) return true;

                    // Match 6: Filename starts with or ends with the "primary" (longest) numeric part
                    const longestPart = idParts.reduce((a, b) => a.length >= b.length ? a : b, "");
                    if (longestPart.length >= 3 && (filenameWithoutExt.startsWith(longestPart) || filenameWithoutExt.endsWith(longestPart))) return true;

                    return false;
                });

                if (!certFileFull) {
                    console.log(`Available files in ZIP: ${allExtractedFiles.map(f => path.basename(f)).join(', ')}`);
                }

                let certificateUrl = null;
                if (certFileFull) {
                    const uploadResult = await cloudinary.uploader.upload(certFileFull, {
                        folder: 'augcvs/certificates',
                        resource_type: 'auto',
                        public_id: `certificate_${studentId.replace(/\//g, '_')}_${Date.now()}`
                    });
                    certificateUrl = uploadResult.secure_url;
                } else {
                    throw new Error(`Certificate file not found in ZIP for ID ${studentId}`);
                }

                const graduateData = {
                    studentId,
                    firstName: row['First Name'] || row['firstName'],
                    lastName: row['Last Name'] || row['lastName'],
                    middleName: row['Middle Name'] || row['middleName'] || '',
                    dateOfBirth: row['Date of Birth'] || row['dateOfBirth'],
                    gender: (row['Gender'] || row['gender'] || 'male').toLowerCase(),
                    program: row['Program'] || row['program'],
                    department: row['Department'] || row['department'],
                    college: row['College'] || row['college'],
                    graduationYear: row['Graduation Year'] || row['graduationYear'],
                    graduationDate: row['Graduation Date'] || row['graduationDate'],
                    degreeType: row['Degree Type'] || row['degreeType'],
                    gpa: row['GPA'] || row['gpa'],
                    certificateNumber: row['Certificate Number'] || row['certificateNumber'],
                    certificateFile: certificateUrl,
                    addedBy: req.user.id,
                    status: 'active'
                };

                if (!graduateData.firstName || !graduateData.lastName) throw new Error('Missing name fields');

                await Graduate.create(graduateData);
                stats.success++;

            } catch (err) {
                stats.failed++;
                stats.errors.push({
                    studentId: studentId || `Row ${i + 2}`,
                    error: err.message
                });
            }
        }

        // Cleanup
        try {
            if (zipPath && fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            if (extractionPath && fs.existsSync(extractionPath)) {
                fs.rmSync(extractionPath, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            console.error('Cleanup error:', cleanupErr);
        }

        await logAudit({
            user: req.user.id,
            action: 'bulk_upload_graduates',
            details: {
                total: stats.total,
                success: stats.success,
                failed: stats.failed
            },
            ip: req.ip
        });

        res.status(200).json({
            success: stats.success > 0,
            message: stats.success > 0
                ? `Successfully processed ${stats.success} records.`
                : `Failed to process any records. Check the error list below.`,
            stats
        });

    } catch (err) {
        console.error('Bulk Upload Error:', err);
        try {
            if (zipPath && fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
            if (extractionPath && fs.existsSync(extractionPath)) {
                fs.rmSync(extractionPath, { recursive: true, force: true });
            }
        } catch (cleanupErr) { console.error('Cleanup error:', cleanupErr); }

        await logAudit({
            user: req.user ? req.user.id : 'system',
            action: 'bulk_upload_failed',
            details: { error: err.message },
            ip: req.ip
        });

        res.status(500).json({ success: false, message: err.message });
    }
};
