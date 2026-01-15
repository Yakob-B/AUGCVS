const express = require('express');
const { check } = require('express-validator');
const {
    createGraduate,
    getGraduates,
    getGraduate,
    updateGraduate,
    deleteGraduate,
    getFilters,
    searchGraduates,
    bulkUploadGraduates
} = require('../controllers/graduate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload, dataUpload, handleUploadError } = require('../middleware/upload.middleware');

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

// ✅ Static and search/filter routes go first
router.get('/filters', authorize('registrar'), getFilters);
router.get('/search', authorize('registrar'), searchGraduates);

// ✅ CRUD routes
router.get('/', authorize('registrar'), getGraduates);

router.post(
    '/',
    authorize('registrar'),
    upload.single('certificateFile'),
    handleUploadError,
    graduateValidation,
    createGraduate
);

router.post(
    '/bulk',
    authorize('registrar'),
    dataUpload.single('file'), // Use dataUpload for local storage of ZIP
    handleUploadError,
    bulkUploadGraduates
);

router.put(
    '/:id',
    authorize('registrar'),
    upload.single('certificateFile'),
    handleUploadError,
    graduateValidation,
    updateGraduate
);

router.get('/:id', authorize('registrar'), getGraduate);
router.delete('/:id', authorize('registrar'), deleteGraduate);

module.exports = router;
