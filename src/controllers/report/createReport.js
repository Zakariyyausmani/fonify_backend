const Report = require('../../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, listingId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'Reported user ID and reason are required' });
    }

    // Prevent users from reporting themselves
    if (reportedUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const report = new Report({
      reporterId: req.user._id,
      reportedUserId,
      listingId, // Optional, depending on context
      reason
    });

    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
