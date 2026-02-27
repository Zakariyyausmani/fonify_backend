const Listing = require('../../models/Listing');
const APIFeatures = require('../../utils/apiFeatures');

// @desc    Get listings by seller
// @route   GET /api/listings/my-listings
// @access  Private (Seller)
exports.getMyListings = async (req, res) => {
  try {
    const queryObj = { sellerId: req.user._id };

    // Pagination Metadata
    const totalCount = await Listing.countDocuments(queryObj);
    const { page, limit } = req.query;
    const pageSize = limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page * 1 || 1;

    const features = new APIFeatures(Listing.find(queryObj), req.query)
      .paginate();

    const listings = await features.query;

    res.json({
      success: true,
      count: listings.length,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: pageSize
      },
      data: listings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
