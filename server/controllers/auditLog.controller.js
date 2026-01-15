const AuditLog = require('../models/auditlog.model');

/**
 * Get all audit logs with pagination and filtering
 */
exports.getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.action) {
            query.action = { $regex: req.query.action, $options: 'i' };
        }

        // Calculate total for pagination
        const total = await AuditLog.countDocuments(query);

        const logs = await AuditLog.find(query)
            .populate('user', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message
        });
    }
};
