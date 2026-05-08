const Listing = require('../../models/Listing');
const APIFeatures = require('../../utils/apiFeatures');

// @desc    Get all active listings
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const { brand, model, condition, minPrice, maxPrice, location, lat, lng, distance, page, limit, featured } = req.query;
    let queryObj = { status: 'approved' };

    if (brand) queryObj.brand = brand;
    if (model) queryObj.model = model;
    if (condition) queryObj.condition = condition;
    if (location) queryObj.location = location;
    if (featured === 'true') queryObj.isFeatured = true;

    // Nearby Search
    if (lat && lng) {
      const radius = distance ? Number(distance) / 6371 : 10 / 6371; // Default 10km radius
      queryObj.locationData = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: (distance ? Number(distance) : 10) * 1000 // Convert km to meters
        }
      };
    }

    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = Number(minPrice);
      if (maxPrice) queryObj.price.$lte = Number(maxPrice);
    }

    // Pagination Metadata
    const totalCount = await Listing.countDocuments(queryObj);
    const pageSize = limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page * 1 || 1;

    const features = new APIFeatures(Listing.find(queryObj).populate('sellerId', 'name profileImage'), req.query)
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
