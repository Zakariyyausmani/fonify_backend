const User = require('../../models/User');
const { createNotification } = require('../notificationController');
const cloudinary = require('../../config/cloudinary');

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
      const deleteImage = async (url) => {
        if (!url || url === 'CLEARED_ON_APPROVAL' || url === 'CLEARED_ON_REJECTION') return;
        try {
          const parts = url.split('/');
          const uploadIndex = parts.indexOf('upload');
          if (uploadIndex === -1) return;

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
      'message',
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
