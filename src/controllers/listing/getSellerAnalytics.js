const Analytics = require('../../models/Analytics');
const Listing = require('../../models/Listing');
const mongoose = require('mongoose');

// @desc    Get analytics for seller's listings
// @route   GET /api/listings/my-analytics
// @access  Private/Seller
exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Get daily aggregate for charts
    const dailyStats = await Analytics.aggregate([
      { 
        $match: { 
          sellerId: new mongoose.Types.ObjectId(sellerId),
          date: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: "$date",
          views: { $sum: "$views" },
          clicks: { $sum: "$clicks" },
          chatRequests: { $sum: "$chatRequests" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Get top performing listings
    const topListings = await Listing.find({ sellerId })
      .sort({ views: -1 })
      .limit(5)
      .select('model brand views clicks chatRequests price images');

    // 3. Get total summary
    const totalStats = await Listing.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalClicks: { $sum: "$clicks" },
          totalChatRequests: { $sum: "$chatRequests" },
          listingCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      summary: totalStats[0] || { totalViews: 0, totalClicks: 0, totalChatRequests: 0, listingCount: 0 },
      dailyStats,
      topListings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
