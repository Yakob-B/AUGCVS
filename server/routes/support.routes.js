const express = require('express');
const {
    getSupportRequests,
    resolveSupportRequest,
    deleteSupportRequest
} = require('../controllers/support.controller');
const { protect, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(requireAdmin);

router.get('/', getSupportRequests);
router.patch('/:id/resolve', resolveSupportRequest);
router.delete('/:id', deleteSupportRequest);

module.exports = router;
