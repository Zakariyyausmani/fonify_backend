const VerificationReport = require('../../models/VerificationReport');

// @desc    Get report detail for buyer
// @route   GET /api/verification/listing/:listingId
// @access  Private
exports.getReportByListing = async (req, res) => {
  try {
    const report = await VerificationReport.findOne({
      listingId: req.params.listingId,
      buyerId: req.user._id,
      status: 'completed'
    }).populate('agentId', 'name profileImage');

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
