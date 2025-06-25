const express = require('express');
const { check } = require('express-validator');
const {
    createVerification,
    getVerifications,
    getVerification,
    processVerification,
    getMyVerifications
} = require('../controllers/verification.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Verification validation middleware
const verificationValidation = [
    check('graduate', 'Graduate ID is required').isMongoId(),
    check('certificateNumber', 'Certificate number is required').not().isEmpty()
];

// Process validation middleware
const processValidation = [
    check('status', 'Status is required').isIn(['approved', 'rejected']),
    check('verificationResult', 'Verification result is required').isIn(['authentic', 'forged', 'invalid']),
    check('comments', 'Comments are required').not().isEmpty()
];

// Routes
router.post(
    '/',
    authorize('external'),
    upload.single('certificateFile'),
    handleUploadError,
    verificationValidation,
    createVerification
);

router.get('/', authorize('admin', 'registrar'), getVerifications);
router.get('/my-requests', authorize('external'), getMyVerifications);
router.get('/:id', getVerification);
router.put('/:id/process', authorize('registrar'), processValidation, processVerification);

module.exports = router; 