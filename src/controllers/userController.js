const User = require('../models/User');

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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;

      if (req.files && req.files.profileImage) {
        user.profileImage = req.files.profileImage[0].path;
      } else if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        currentMode: updatedUser.currentMode,
        profileImage: updatedUser.profileImage
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add/Remove from favorites
// @route   POST /api/users/favorites/:id
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;

    if (user.favorites.includes(listingId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    } else {
      user.favorites.push(listingId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit identity verification (CNIC, Selfie, Location)
// @route   POST /api/users/verify-identity
// @access  Private
exports.verifyIdentity = async (req, res) => {
  try {
    console.log('--- Verify Identity Request ---');
    console.log('Body fields:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'None');

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { cnic, city } = req.body;
    let { location, details } = req.body;

    // Handle files from Cloudinary
    if (req.files) {
      console.log('Processing files...');
      // Initialize if missing
      if (!user.cnicImages) {
        user.cnicImages = { front: '', back: '' };
      }

      if (req.files.cnicFront && req.files.cnicFront[0]) {
        user.cnicImages.front = req.files.cnicFront[0].path;
      }
      if (req.files.cnicBack && req.files.cnicBack[0]) {
        user.cnicImages.back = req.files.cnicBack[0].path;
      }
      if (req.files.selfie && req.files.selfie[0]) {
        user.selfieImage = req.files.selfie[0].path;
      }

      // Explicitly mark as modified
      user.markModified('cnicImages');
    }

    if (cnic) user.cnic = cnic;
    if (city) user.city = city;

    // Parse location if it's a string
    if (location) {
      console.log('Processing location...');
      if (typeof location === 'string') {
        try {
          location = JSON.parse(location);
        } catch (e) {
          console.error('Location parsing error:', e.message);
        }
      }

      if (location && (Array.isArray(location.coordinates) || (location.lat && location.lng))) {
        let coords;
        if (Array.isArray(location.coordinates)) {
          coords = [
            parseFloat(location.coordinates[0]) || 0,
            parseFloat(location.coordinates[1]) || 0
          ];
        } else {
          coords = [
            parseFloat(location.lng) || 0,
            parseFloat(location.lat) || 0
          ];
        }

        // Ensure the location structure exists
        if (!user.location) {
          user.location = { type: 'Point', coordinates: [0, 0] };
        }
        user.location.type = 'Point';
        user.location.coordinates = coords;
        user.markModified('location');
      }
    }

    // Parse details/metadata
    if (details) {
      console.log('Processing details...');
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (e) {
          console.error('Details parsing error:', e.message);
        }
      }

      if (typeof details === 'object' && details !== null) {
        // Since identityVerificationDetails is a Map in the schema
        for (const [key, value] of Object.entries(details)) {
          user.identityVerificationDetails.set(key, String(value));
        }
      }
    }

    user.identityVerificationStatus = 'pending';

    console.log('Attempting to save user verification...');
    const updatedUser = await user.save();
    console.log('Verification request saved successfully for user:', updatedUser._id);

    res.json({
      message: 'Verification request submitted successfully',
      status: updatedUser.identityVerificationStatus,
      user: {
        cnicImages: updatedUser.cnicImages,
        selfieImage: updatedUser.selfieImage
      }
    });
  } catch (error) {
    console.error('Verify Identity Fatal Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({
      message: 'Internal server error during verification.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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
      user.currentMode = 'seller'; // Automatically switch to seller mode after setup

      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
