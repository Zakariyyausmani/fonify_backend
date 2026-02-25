const Listing = require('../models/Listing');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get all pending listings
// @route   GET /api/admin/listings/pending
// @access  Private (Admin)
exports.getPendingListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending' }).populate('sellerId', 'name email');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject listing
// @route   PUT /api/admin/listings/:id/status
// @access  Private (Admin)
exports.updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const listing = await Listing.findById(req.params.id);
    if (listing) {
      listing.status = status;
      await listing.save();

      // Notify the seller
      await createNotification(
        listing.sellerId,
        `Listing ${status.toUpperCase()}`,
        `Your listing for ${listing.brand} ${listing.model} has been ${status}.`,
        status === 'approved' ? 'listing_approved' : 'listing_rejected',
        listing._id
      );

      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role;
      await user.save();
      res.json({ _id: user._id, role: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending identity verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin)
exports.getPendingVerifications = async (req, res) => {
  try {
    const users = await User.find({ identityVerificationStatus: 'pending' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject user identity verification
// @route   PUT /api/admin/users/:id/verification
// @access  Private (Admin)
exports.updateUserVerificationStatus = async (req, res) => {
  try {
    const { status, reason } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldStatus = user.identityVerificationStatus;
    user.identityVerificationStatus = status;
    user.isVerified = status === 'verified';

    if (reason) {
      user.identityVerificationDetails = {
        ...user.identityVerificationDetails,
        rejectionReason: reason
      };
    }

    // If approved or rejected, cleanup images from Cloudinary to reclaim space and ensure privacy
    if (status === 'verified' || status === 'rejected') {
      const cloudinary = require('../config/cloudinary');
      const deleteImage = async (url) => {
        if (!url || url === 'CLEARED_ON_APPROVAL' || url === 'CLEARED_ON_REJECTION') return;
        try {
          // Robust public_id extraction
          // URL format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
          const parts = url.split('/');
          const uploadIndex = parts.indexOf('upload');
          if (uploadIndex === -1) return;

          // The publicId starts after the version (v12345)
          // Find the index after 'upload' and then look for the first part that starts with 'v' followed by numbers
          let versionIndex = uploadIndex + 1;
          while (versionIndex < parts.length && !/^v\d+/.test(parts[versionIndex])) {
            versionIndex++;
          }

          if (versionIndex >= parts.length - 1) return;

          const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
          const publicId = publicIdWithExt.split('.')[0];

          console.log(`Deleting Cloudinary asset: ${publicId}`);
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Cloudinary deletion failed:', err.message);
        }
      };

      if (user.cnicImages) {
        if (user.cnicImages.front) await deleteImage(user.cnicImages.front);
        if (user.cnicImages.back) await deleteImage(user.cnicImages.back);
        const placeholder = status === 'verified' ? 'CLEARED_ON_APPROVAL' : 'CLEARED_ON_REJECTION';
        user.cnicImages = { front: placeholder, back: placeholder };
        user.markModified('cnicImages');
      }

      if (user.selfieImage) {
        await deleteImage(user.selfieImage);
        user.selfieImage = status === 'verified' ? 'CLEARED_ON_APPROVAL' : 'CLEARED_ON_REJECTION';
      }
    }

    await user.save();

    // Notify the user
    await createNotification(
      user._id,
      status === 'verified' ? 'Account Verified!' : 'Verification Rejected',
      status === 'verified'
        ? 'Congratulations! You are approved from the admin. Your seller features are now unlocked.'
        : `Your identity verification request has been rejected.${reason ? ' Reason: ' + reason : ''}`,
      'message', // Using 'message' type as requested
      null
    );

    res.json({
      _id: user._id,
      identityVerificationStatus: user.identityVerificationStatus,
      isVerified: user.isVerified,
      message: status === 'verified'
        ? 'Identity verified and documents cleared from storage.'
        : `Verification rejected.${reason ? ' Reason: ' + reason : ''} Documents cleared.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
