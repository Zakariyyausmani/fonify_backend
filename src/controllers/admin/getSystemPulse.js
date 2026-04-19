const User = require('../../models/User');
const Listing = require('../../models/Listing');
const Transaction = require('../../models/Transaction');
const Report = require('../../models/Report');

// @desc    Get system-wide summary metrics
// @route   GET /api/admin/pulse
// @access  Private (Admin)
exports.getSystemPulse = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAgents,
      pendingListings,
      activeDisputes,
      unresolvedReports,
      verificationTasks
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'agent' }),
      Listing.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ status: 'held' }), // Held funds = active disputes or awaiting verif
      Report.countDocuments({ status: 'pending' }),
      Listing.countDocuments({ isVerified: false, status: 'approved' }) // Listings needing field verif
    ]);

    res.json({
      success: true,
      data: {
        population: {
          users: totalUsers,
          agents: totalAgents,
        },
        backlog: {
          listings: pendingListings,
          verifications: verificationTasks,
        },
        security: {
          disputes: activeDisputes,
          reports: unresolvedReports,
        },
        systemStatus: 'Operational',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
