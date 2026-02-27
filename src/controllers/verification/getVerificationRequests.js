const VerificationReport = require('../../models/VerificationReport');
const APIFeatures = require('../../utils/apiFeatures');

// @desc    Get all verification requests (Admin/Agent)
// @route   GET /api/verification/requests
// @access  Private (Agent/Admin)
exports.getVerificationRequests = async (req, res) => {
  try {
    let queryObj = {};
    if (req.user.role === 'agent') {
      queryObj = { $or: [{ status: 'requested' }, { agentId: req.user._id }] };
    }

    // Pagination Metadata
    const totalCount = await VerificationReport.countDocuments(queryObj);
    const { page, limit } = req.query;
    const pageSize = limit * 1 || 10;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page * 1 || 1;

    const features = new APIFeatures(
      VerificationReport.find(queryObj)
        .populate('listingId', 'brand model images price')
        .populate('buyerId', 'name phoneNumber'),
      req.query
    ).paginate();

    const reports = await features.query;

    res.json({
      success: true,
      count: reports.length,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit: pageSize
      },
      data: reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
