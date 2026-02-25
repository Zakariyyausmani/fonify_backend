const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (override if exists)
    await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    // Send Email
    await sendEmail({
      email,
      subject: 'Fonify - Email Verification OTP',
      message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #6200EE;">Email Verification</h2>
          <p>Thank you for choosing Fonify! Use the following code to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 20px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
