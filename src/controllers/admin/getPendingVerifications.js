const User = require('../../models/User');
const APIFeatures = require('../../utils/apiFeatures');

// @desc    Get all pending identity verifications
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin)
exports.getPendingVerifications = async (req, res) => {
  try {
    const queryObj = { identityVerificationStatus: 'pending' };

    // Pagination Metadata
    const totalCount = await User.countDocuments(queryObj);
    const { page, limit } = req.query;
    const pageSize = limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page * 1 || 1;

    const features = new APIFeatures(
      User.find(queryObj).select('-password'),
      req.query
    ).paginate();

    const users = await features.query;

    res.json({
      success: true,
      count: users.length,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: pageSize
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
