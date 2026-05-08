const VerificationReport = require('../../models/VerificationReport');
const { createNotification } = require('../notificationController');
const Listing = require('../../models/Listing');
const Message = require('../../models/Message');
// @desc    Assign an agent to a verification request
// @route   PUT /api/verification/:id/assign
// @access  Private (Agent/Admin)
exports.assignAgent = async (req, res) => {
  try {
    const report = await VerificationReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.status !== 'requested') {
      return res.status(400).json({ message: 'Already assigned or completed' });
    }

    // Admins can assign a specific agent, otherwise the agent assigns themselves
    let assignedAgentId = req.user._id;
    if (req.user.role === 'admin' && req.body.agentId) {
      assignedAgentId = req.body.agentId;
    }

    report.agentId = assignedAgentId;
    report.status = 'negotiating';
    await report.save();

    const listing = await Listing.findById(report.listingId);
    if (listing) {
      await createNotification(
        report.buyerId,
        'Agent Verification Started',
        `An agent has been assigned for ${listing.brand} ${listing.model}. Check your chats to start negotiating!`,
        'agent_assigned',
        listing._id
      );

      // Notify the Assigned Agent
      if (req.user.role === 'admin' && req.body.agentId) {
        await createNotification(
          assignedAgentId,
          'New Hardware Verification Task',
          `Admin assigned you to verify a ${listing.brand} ${listing.model}. Check your dashboard.`,
          'agent_assigned',
          listing._id
        );
      }

      // Generate Automated Handshake Message
      await Message.create({
        senderId: assignedAgentId, // The Agent
        receiverId: report.buyerId, // The Buyer
        listingId: listing._id,
        content: `Hello! I am your Fonify-approved Agent. Let's negotiate my service rate and fix a safe meeting point to physically verify this ${listing.brand} ${listing.model}.`
      });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
