const Listing = require('../../models/Listing');

const getApprovedListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'approved' })
      .sort({ isFeatured: -1, createdAt: -1 })
      .populate('sellerId', 'name email profileImage')
      .limit(100);

    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching approved listings', error: error.message });
  }
};

module.exports = { getApprovedListings };
