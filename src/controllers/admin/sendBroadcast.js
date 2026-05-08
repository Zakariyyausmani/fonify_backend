const ActivityLog = require('../../models/ActivityLog');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const socketManager = require('../../services/socketManager');

exports.sendBroadcast = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    // 1. Attempt Real-time Socket Broadcast (Best Effort)
    try {
      socketManager.getIO().emit('admin_broadcast', { title, message, timestamp: new Date() });
    } catch (socketError) {
      console.log('Socket broadcast skipped (likely serverless environment/no active sockets)');
    }

    // 2. Persist Notification for all users in background
    // Note: For 100k+ users, this should ideally be handled by a worker queue (bull/redis)
    // For now, we use a bulk insert to ensure the dashboard remains premium and functional
    const users = await User.find({}, '_id');
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type: 'system',
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications, { ordered: false });
    }

    // 3. Log the action
    await ActivityLog.create({
      adminId: req.user._id,
      action: 'send_admin_broadcast',
      targetType: 'System',
      targetId: req.user._id,
      details: { title, message, userCount: users.length }
    });

    res.status(200).json({ 
      success: true, 
      message: `Broadcast successfully distributed to ${users.length} accounts.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
