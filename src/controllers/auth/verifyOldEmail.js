const User = require('../../models/User');
const Otp = require('../../models/Otp');
const sendEmail = require('../../utils/emailService');

// @desc    Verify old email OTP - Step 2: Verify old OTP and send to new email
// @route   POST /api/auth/verify-old-email
// @access  Private
exports.verifyOldEmail = async (req, res) => {
  try {
    const { otp, newEmail } = req.body;
    const user = await User.findById(req.user._id);

    const otpRecord = await Otp.findOne({ email: user.email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if new email is already in use
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'New email is already registered' });
    }

    // Send OTP to new email
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndUpdate({ email: newEmail }, { otp: newOtp }, { upsert: true, new: true });

    await sendEmail({
      email: newEmail,
      subject: 'Fonify - Confirm Your New Email',
      message: `Your verification code to confirm your new email is: ${newOtp}.`
    });

    res.json({ message: 'OTP sent to your new email. Please verify to complete the change.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
