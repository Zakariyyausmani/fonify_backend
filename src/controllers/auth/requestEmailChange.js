const User = require('../../models/User');
const Otp = require('../../models/Otp');
const sendEmail = require('../../utils/emailService');

// @desc    Request email change - Step 1: Send OTP to old email
// @route   POST /api/auth/request-email-change
// @access  Private
exports.requestEmailChange = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate({ email: user.email }, { otp }, { upsert: true, new: true });

    await sendEmail({
      email: user.email,
      subject: 'Fonify - Email Change Request',
      message: `Your verification code to start your email change is: ${otp}. Do not share this with anyone.`
    });

    res.json({ message: 'OTP sent to your current email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
