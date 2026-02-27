const VerificationReport = require('../../models/VerificationReport');

// @desc    Assign an agent to a verification request
// @route   PUT /api/verification/:id/assign
// @access  Private (Agent)
exports.assignAgent = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.status !== 'requested') {
      return res.status(400).json({ message: 'Already assigned or completed' });
    }

    report.agentId = req.user._id;
    report.status = 'assigned';
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
