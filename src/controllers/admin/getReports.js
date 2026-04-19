const Report = require('../../models/Report');

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedUserId', 'name email')
      .populate('listingId', 'brand model');

    res.json({ data: reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
