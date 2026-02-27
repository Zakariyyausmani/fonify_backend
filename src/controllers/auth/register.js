const User = require('../../models/User');
const generateToken = require('./generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentMode: user.currentMode,
        token: generateToken(user._id),
        identityVerificationStatus: user.identityVerificationStatus,
        isVerified: user.isVerified,
        isShopSetup: user.isShopSetup,
        shopInfo: user.shopInfo
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
