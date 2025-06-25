const express = require('express');
const { check } = require('express-validator');
const {
    createGraduate,
    getGraduates,
    getGraduate,
    updateGraduate,
    deleteGraduate,
    searchGraduates
} = require('../controllers/graduate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Graduate validation middleware
const graduateValidation = [
    check('studentId', 'Student ID is required').not().isEmpty(),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('dateOfBirth', 'Date of birth is required').isDate(),
    check('gender', 'Gender is required').isIn(['male', 'female', 'other']),
    check('program', 'Program is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty(),
    check('college', 'College is required').not().isEmpty(),
    check('graduationYear', 'Graduation year is required').isNumeric(),
    check('graduationDate', 'Graduation date is required').isDate(),
    check('degreeType', 'Degree type is required').not().isEmpty(),
    check('gpa', 'GPA is required').isNumeric(),
    check('certificateNumber', 'Certificate number is required').not().isEmpty()
];

// Routes
router.post(
    '/',
    authorize('admin', 'registrar'),
    upload.single('certificateFile'),
    handleUploadError,
    graduateValidation,
    createGraduate
);

router.put(
    '/:id',
    authorize('admin', 'registrar'),
    upload.single('certificateFile'),
    handleUploadError,
    graduateValidation,
    updateGraduate
);

router.get('/', authorize('admin', 'registrar'), getGraduates);
router.get('/search', authorize('admin', 'registrar'), searchGraduates);
router.get('/:id', authorize('admin', 'registrar'), getGraduate);
router.delete('/:id', authorize('admin'), deleteGraduate);

module.exports = router; 