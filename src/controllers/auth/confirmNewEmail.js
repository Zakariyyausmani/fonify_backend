const User = require('../../models/User');
const Otp = require('../../models/Otp');

// @desc    Confirm new email - Step 3: Verify new OTP and update DB
// @route   POST /api/auth/confirm-new-email
// @access  Private
exports.confirmNewEmail = async (req, res) => {
  try {
    const { otp, newEmail } = req.body;
    const user = await User.findById(req.user._id);

    const otpRecord = await Otp.findOne({ email: newEmail, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    res.json({ message: 'Email updated successfully', email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
