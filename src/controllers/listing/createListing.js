const Listing = require('../../models/Listing');
const imeiService = require('../../services/imeiService');

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private (Seller)
exports.createListing = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const { lat, lng, specifications: specsBody, imei, ...rest } = req.body;
    let specifications = specsBody;
    if (typeof specifications === 'string') {
      try { specifications = JSON.parse(specifications); } catch (e) { console.error(e); }
    }

    let imeiVerificationResult = null;
    if (imei) {
      imeiVerificationResult = await imeiService.verifyImei(imei);
    }

    const listingPayload = {
      ...rest,
      specifications,
      imei,
      imeiVerificationResult,
      images: imageUrls,
      sellerId: req.user._id,
      status: 'pending'
    };

    if (lat && lng) {
      listingPayload.locationData = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      };
    }

    const listing = new Listing(listingPayload);

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
