const User = require('../../models/User');

// @desc    Get the primary support Admin info
// @route   GET /api/user/admin-contact
// @access  Private
exports.getAdminContact = async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: 'admin' }).select('_id name profileImage');
    if (!adminUser) {
      return res.status(404).json({ message: 'No support administrators currently configured on the platform.' });
    }
    
    res.json({
      id: adminUser._id,
      name: 'Fonify Support (Admin)',
      profileImage: adminUser.profileImage || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
