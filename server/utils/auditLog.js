const AuditLog = require('../models/auditlog.model');

/**
 * Log an audit event
 * @param {Object} params
 * @param {String|mongoose.Types.ObjectId} [params.user] - User ID (optional)
 * @param {String} params.action - Action performed (required)
 * @param {Object} [params.details] - Additional details (optional)
 * @param {String} [params.ip] - IP address (optional)
 * @returns {Promise<AuditLog>} The created audit log document
 */
const logAudit = async ({ user = null, action, details = {}, ip = '' }) => {
  if (!action) throw new Error('Audit log action is required');
  const log = new AuditLog({ user, action, details, ip });
  return await log.save();
};

module.exports = logAudit; 