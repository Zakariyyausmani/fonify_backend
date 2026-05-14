const Analytics = require('../models/Analytics');
const Listing = require('../models/Listing');

/**
 * Increment analytics for a listing
 * @param {string} listingId 
 * @param {'views'|'clicks'|'chatRequests'} type 
 */
exports.trackMetric = async (listingId, type) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // 1. Update the main Listing counter
    const listing = await Listing.findByIdAndUpdate(
      listingId,
      { $inc: { [type]: 1 } },
      { new: true }
    );

    if (!listing) return;

    // 2. Update/Create daily analytics record
    await Analytics.findOneAndUpdate(
      { listingId, date: today },
      { 
        $inc: { [type]: 1 },
        $setOnInsert: { sellerId: listing.seller }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};
