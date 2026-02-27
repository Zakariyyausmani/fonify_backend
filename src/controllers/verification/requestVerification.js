const VerificationReport = require('../../models/VerificationReport');
const Listing = require('../../models/Listing');

// @desc    Request a physical verification
// @route   POST /api/verification/request
// @access  Private (Buyer)
exports.requestVerification = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const existingReport = await VerificationReport.findOne({ listingId, buyerId: req.user._id });
    if (existingReport) return res.status(400).json({ message: 'Verification already requested' });

    const report = new VerificationReport({
      listingId,
      buyerId: req.user._id,
      status: 'requested'
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
