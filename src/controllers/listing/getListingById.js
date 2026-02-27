const Listing = require('../../models/Listing');

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('sellerId', 'name profileImage phoneNumber');
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      await listing.save();
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
