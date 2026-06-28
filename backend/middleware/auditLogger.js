const AuditLog = require('../models/AuditLog');

const logAction = async (userId, orgId, action, details) => {
  try {
    if (!userId || !orgId) return;
    await AuditLog.create({
      user: userId,
      organization: orgId,
      action,
      details,
    });
  } catch (err) {
    console.error('Audit logging error:', err.message);
  }
};

module.exports = { logAction };
