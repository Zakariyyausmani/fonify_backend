const VerificationReport = require('../../models/VerificationReport');
const { createNotification } = require('../notificationController');
const Listing = require('../../models/Listing');

// @desc    Schedule meeting and finalize negotiated rate
// @route   PUT /api/verification/:id/schedule
// @access  Private (Agent)
exports.scheduleMeeting = async (req, res) => {
  try {
    const { negotiatedRate, meetingPoint } = req.body;

    if (!negotiatedRate || !meetingPoint) {
      return res.status(400).json({ message: 'Rate and Meeting Point are required' });
    }

    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.agentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (report.status !== 'negotiating') {
      return res.status(400).json({ message: 'Cannot schedule meeting unless in negotiating status' });
    }

    report.negotiatedRate = negotiatedRate;
    report.meetingPoint = meetingPoint;
    report.status = 'meeting_scheduled';
    await report.save();

    const listing = await Listing.findById(report.listingId);
    if (listing) {
      await createNotification(
        report.buyerId,
        'Meeting Scheduled',
        `The agent has set the meeting point at ${meetingPoint} and rate at ${negotiatedRate} for ${listing.brand} ${listing.model}.`,
        'meeting_scheduled',
        listing._id
      );
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
