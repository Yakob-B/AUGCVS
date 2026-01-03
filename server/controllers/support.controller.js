const SupportRequest = require('../models/support.model');
const logAudit = require('../utils/auditLog');

// @desc    Get all support requests
// @route   GET /api/support
// @access  Private/Admin
exports.getSupportRequests = async (req, res) => {
    try {
        const requests = await SupportRequest.find()
            .populate('resolvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (err) {
        console.error('Error fetching support requests:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark support request as resolved
// @route   PATCH /api/support/:id/resolve
// @access  Private/Admin
exports.resolveSupportRequest = async (req, res) => {
    try {
        const request = await SupportRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status === 'resolved') {
            return res.status(400).json({ success: false, message: 'Request already resolved' });
        }

        request.status = 'resolved';
        request.resolvedBy = req.user.id;
        request.resolvedAt = Date.now();
        await request.save();

        await logAudit({
            user: req.user.id,
            action: 'support_request_resolved',
            details: { requestId: request._id, userEmail: request.userEmail },
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            data: request,
            message: 'Support request marked as resolved'
        });
    } catch (err) {
        console.error('Error resolving support request:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete support request
// @route   DELETE /api/support/:id
// @access  Private/Admin
exports.deleteSupportRequest = async (req, res) => {
    try {
        const request = await SupportRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        await request.deleteOne();

        await logAudit({
            user: req.user.id,
            action: 'support_request_deleted',
            details: { requestId: req.params.id },
            ip: req.ip
        });

        res.status(200).json({
            success: true,
            message: 'Support request deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting support request:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
