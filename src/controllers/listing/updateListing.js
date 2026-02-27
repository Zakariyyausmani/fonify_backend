const Listing = require('../../models/Listing');

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (Seller/Admin)
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const imageUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path) : listing.images;

      let specifications = req.body.specifications || listing.specifications;
      if (typeof specifications === 'string') {
        try { specifications = JSON.parse(specifications); } catch (e) { console.error(e); }
      }

      Object.assign(listing, req.body);
      listing.images = imageUrls;
      listing.specifications = specifications;
      listing.status = 'pending';

      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
