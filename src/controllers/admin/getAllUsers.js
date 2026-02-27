const User = require('../../models/User');
const APIFeatures = require('../../utils/apiFeatures');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Pagination Metadata
    const totalCount = await User.countDocuments({});
    const { page, limit } = req.query;
    const pageSize = limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page * 1 || 1;

    const features = new APIFeatures(
      User.find({}).select('-password'),
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
