const User = require('../../models/User');

// @desc    Toggle between Buyer and Seller mode
// @route   PUT /api/users/toggle-mode
// @access  Private
exports.toggleMode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.currentMode = user.currentMode === 'buyer' ? 'seller' : 'buyer';
      await user.save();
      res.json({
        _id: user._id,
        currentMode: user.currentMode
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
