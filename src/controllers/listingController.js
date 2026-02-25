const Listing = require('../models/Listing');

// @desc    Get all active listings
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const { brand, model, condition, minPrice, maxPrice, location } = req.query;
    let query = { status: 'approved' }; // Only show approved listings to general public

    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (condition) query.condition = condition;
    if (location) query.location = location;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query).populate('sellerId', 'name profileImage');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('sellerId', 'name profileImage phoneNumber');
    if (listing) {
      // Increment views
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

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private (Seller)
exports.createListing = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    // Parse specifications if sent as a string (common in multipart)
    let specifications = req.body.specifications;
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        console.error('Error parsing specifications:', e);
      }
    }

    const listing = new Listing({
      ...req.body,
      specifications,
      images: imageUrls,
      sellerId: req.user._id,
      status: 'pending' // Needs admin approval
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

      const imageUrls = req.files && req.files.length > 0
        ? req.files.map(file => file.path)
        : listing.images;

      // Parse specifications if sent as a string
      let specifications = req.body.specifications || listing.specifications;
      if (typeof specifications === 'string') {
        try {
          specifications = JSON.parse(specifications);
        } catch (e) {
          console.error('Error parsing specifications:', e);
        }
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

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Seller/Admin)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await listing.deleteOne();
      res.json({ message: 'Listing removed' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get listings by seller
// @route   GET /api/listings/my-listings
// @access  Private (Seller)
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user._id });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
