const User = require('../../models/User');

// @desc    Update shop information and complete setup
// @route   PUT /api/users/setup-shop
// @access  Private
exports.updateShopInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { storeName, description, address } = req.body;

      user.shopInfo = {
        storeName: storeName || user.name,
        description: description || '',
        address: address || ''
      };
      user.isShopSetup = true;
      user.currentMode = 'seller';

      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
