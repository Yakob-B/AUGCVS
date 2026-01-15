const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected and restricted to admin/registrar
router.use(protect);
router.use(authorize('admin', 'registrar', 'superadmin'));

router.get('/', auditLogController.getLogs);

module.exports = router;
