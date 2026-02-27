const Listing = require('../../models/Listing');
const { createNotification } = require('../notificationController');

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
