const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// j
// @route   POST /api/users/profile-image
// @access  Private
exports.updateProfileImage = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : req.body.image;

    if (!imageUrl) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileImage = imageUrl;
    await user.save();

    res.json({
      message: 'Profile image updated',
      profileImage: user.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle bookmark for a rule
// @route   POST /api/users/bookmarks/:ruleId
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const ruleId = req.params.ruleId;

    const isBookmarked = user.bookmarks.some(b => b.toString() === ruleId);

    if (isBookmarked) {
      user.bookmarks.pull(ruleId);
    } else {
      user.bookmarks.addToSet(ruleId);
    }

    await user.save();
    res.json({
      bookmarks: user.bookmarks,
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/users/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
