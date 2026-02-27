const User = require('../../models/User');
const { handleFiles, parseLocation, parseDetails } = require('./verifyIdentityHelper');

// @desc    Submit identity verification (CNIC, Selfie, Location)
// @route   POST /api/users/verify-identity
// @access  Private
exports.verifyIdentity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { cnic, city, location, details } = req.body;

    handleFiles(req, user);
    if (cnic) user.cnic = cnic;
    if (city) user.city = city;
    parseLocation(location, user);
    parseDetails(details, user);

    user.identityVerificationStatus = 'pending';
    const updatedUser = await user.save();

    res.json({
      message: 'Verification request submitted successfully',
      status: updatedUser.identityVerificationStatus,
      user: {
        cnicImages: updatedUser.cnicImages,
        selfieImage: updatedUser.selfieImage
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Internal server error during verification.', error: error.message });
  }
};
