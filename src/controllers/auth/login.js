const User = require('../../models/User');
const generateToken = require('./generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
    });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        currentMode: user.currentMode,
        token: generateToken(user._id),
        identityVerificationStatus: user.identityVerificationStatus,
        isVerified: user.isVerified,
        isShopSetup: user.isShopSetup,
        shopInfo: user.shopInfo
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
