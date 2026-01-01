const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary.config');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Generate filename based on context
        let filename;
        if (req.baseUrl.includes('graduates')) {
            // For graduate records (admin upload)
            const sanitizedStudentId = req.body.studentId ? req.body.studentId.replace(/\//g, '_') : 'unknown';
            filename = `certificate_${sanitizedStudentId}_${Date.now()}`;
        } else if (req.baseUrl.includes('verifications')) {
            // For verification requests (external user upload)
            filename = `verification_${req.user.id}_${Date.now()}`;
        } else {
            // Fallback
            filename = `upload_${Date.now()}`;
        }

        return {
            folder: 'augcvs/certificates',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            resource_type: 'auto',
            type: 'upload', // Use 'upload' type for public access
            public_id: filename,
            invalidate: true // Clear CDN cache on upload
        };
    }
});

// Check file type
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|pdf/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and image files (PDF, JPG, JPEG, PNG) are allowed!'));
    }
};

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size cannot exceed 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        // Handle all other errors (e.g., file type)
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload error'
        });
    }
    next();
};

// Set up Local storage for bulk uploads (temporary)
const localDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `bulk_${Date.now()}_${file.originalname}`);
    }
});

const dataFileFilter = (req, file, cb) => {
    // Allowed file types
    const filetypes = /csv|xlsx|xls/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const mimetype = mimetypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only CSV and Excel files are allowed!'));
    }
};

const dataUpload = multer({
    storage: localDiskStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    fileFilter: dataFileFilter
});

module.exports = { upload, dataUpload, handleUploadError };