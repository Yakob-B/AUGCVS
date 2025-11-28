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