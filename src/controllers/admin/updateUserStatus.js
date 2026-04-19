const User = require('../../models/User');

// @desc    Update user suspension status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, suspendReason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof isSuspended === 'boolean') {
      user.isSuspended = isSuspended;
      if (isSuspended && suspendReason) {
        user.suspendReason = suspendReason;
      } else if (!isSuspended) {
        user.suspendReason = null;
      }
    }

    await user.save();
    res.json({ 
      _id: user._id, 
      isSuspended: user.isSuspended, 
      suspendReason: user.suspendReason 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
