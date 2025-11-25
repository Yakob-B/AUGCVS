const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Get file extension
        const ext = path.extname(file.originalname).toLowerCase();

        // Generate filename based on context
        let filename;
        if (req.baseUrl.includes('graduates')) {
            // For graduate records (admin upload)
            // Sanitize studentId by replacing slashes with underscores
            const sanitizedStudentId = req.body.studentId ? req.body.studentId.replace(/\//g, '_') : 'unknown';
            filename = `certificate_${sanitizedStudentId}_${Date.now()}${ext}`;
        } else if (req.baseUrl.includes('verifications')) {
            // For verification requests (external user upload)
            filename = `verification_${req.user.id}_${Date.now()}${ext}`;
        } else {
            // Fallback
            filename = `${Date.now()}-${file.originalname}`;
        }

        cb(null, filename);
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

module.exports = { upload, handleUploadError };