const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs for the user's organization (Admin only)
// @route   GET /api/audit
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    // Admin check
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized. Admins only.');
    }

    const logs = await AuditLog.find({ organization: req.user.organization })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 entries

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
