const VerificationReport = require('../../models/VerificationReport');
const Listing = require('../../models/Listing');
const User = require('../../models/User');
const { createNotification } = require('../notificationController');

// @desc    Submit verification report
// @route   PUT /api/verification/:id/submit
// @access  Private (Agent)
exports.submitReport = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.agentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    report.checks = req.body.checks;
    report.comments = req.body.comments;
    report.reportImages = req.body.reportImages;
    report.status = 'completed';
    report.completedDate = Date.now();

    await report.save();

    const listing = await Listing.findByIdAndUpdate(report.listingId, { verificationStatus: 'verified' });

    await createNotification(
      report.buyerId,
      'Verification Report Ready',
      `The physical inspection report for ${listing.brand} ${listing.model} is now available.`,
      'verification_ready',
      listing._id
    );

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'Report Submitted',
        `${req.user.name} has submitted a verification report for ${listing.brand} ${listing.model}.`,
        'agent_report_submitted',
        listing._id
      );
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
