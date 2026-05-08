const VerificationReport = require('../../models/VerificationReport');
const Message = require('../../models/Message');

// @desc    Get chat logs between Agent and Buyer for a specific Verification Report
// @route   GET /api/admin/verifications/:id/chats
// @access  Private (Admin)
exports.getVerificationChats = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (!report.agentId) {
      return res.status(400).json({ message: 'No agent assigned to this report yet' });
    }

    // Find messages between buyer and agent regarding this listing
    const messages = await Message.find({
      listingId: report.listingId,
      $or: [
        { senderId: report.buyerId, receiverId: report.agentId },
        { senderId: report.agentId, receiverId: report.buyerId }
      ]
    }).sort({ createdAt: 1 }).populate('senderId', 'name role').populate('receiverId', 'name role');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
