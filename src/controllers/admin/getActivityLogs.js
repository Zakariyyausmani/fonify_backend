const ActivityLog = require('../../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('adminId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to top 100 recent logs for performance

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
