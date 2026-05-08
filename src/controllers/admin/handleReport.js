const Report = require('../../models/Report');
const User = require('../../models/User');

// @desc    Handle a report (resolve, optionally suspend user)
// @route   PUT /api/admin/reports/:id/action
// @access  Private/Admin
exports.handleReport = async (req, res) => {
  try {
    const { action, suspendReason } = req.body; // action can be 'dismiss' or 'suspend'

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (action === 'suspend') {
      const offendingUser = await User.findById(report.reportedUserId);
      if (offendingUser) {
        offendingUser.isSuspended = true;
        offendingUser.suspendReason = suspendReason || 'Violation of platform policies (Reported)';
        await offendingUser.save();
      }
    }

    report.status = 'resolved';
    await report.save();

    res.json({ message: `Report handled: User ${action === 'suspend' ? 'suspended' : 'dismissed'}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
