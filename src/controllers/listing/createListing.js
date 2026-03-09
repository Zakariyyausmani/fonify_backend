const Listing = require('../../models/Listing');

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private (Seller)
exports.createListing = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const { lat, lng, specifications: specsBody, ...rest } = req.body;
    let specifications = specsBody;
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { console.error(e); }
    }

    const listing = new Listing({
      ...rest,
      specifications,
      images: imageUrls,
      sellerId: req.user._id,
      locationData: {
        type: 'Point',
        coordinates: lat && lng ? [Number(lng), Number(lat)] : undefined
      },
      status: 'pending'
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    console.error('--- Create Listing Error ---');
    console.error(error);
    res.status(500).json({
      message: 'Failed to create listing',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
