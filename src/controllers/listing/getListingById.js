const Listing = require('../../models/Listing');
const { trackMetric } = require('../../services/analyticsService');

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('sellerId', 'name profileImage phoneNumber averageRating reviewCount isVerified');
    
    if (listing) {
      // Async track view (don't wait for it to respond to user)
      trackMetric(listing._id, 'views');
      
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
