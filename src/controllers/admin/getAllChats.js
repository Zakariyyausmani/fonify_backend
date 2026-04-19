const Message = require('../../models/Message');

// @desc    Get all conversations across the platform (for rate fixing monitoring)
// @route   GET /api/admin/chats
// @access  Private (Admin)
exports.getAllChats = async (req, res) => {
  try {
    // We want to fetch all messages and group them by conversation
    // A conversation is defined by a listingId and the pair of users communicating.
    
    // Sort all messages by latest first
    const messages = await Message.find({})
      .populate('listingId', 'brand model price images')
      .populate('senderId', 'name profileImage role')
      .populate('receiverId', 'name profileImage role')
      .sort({ createdAt: -1 });

    const conversations = [];
    const seen = new Set();

    for (const msg of messages) {
      if (!msg.listingId || !msg.senderId || !msg.receiverId) continue;
      
      // Ensure pair hash is consistent regardless of who sent the message
      const users = [msg.senderId._id.toString(), msg.receiverId._id.toString()].sort();
      const conversationKey = `${msg.listingId._id}_${users[0]}_${users[1]}`;

      if (!seen.has(conversationKey)) {
        conversations.push({
          conversationId: conversationKey,
          listing: msg.listingId,
          userA: msg.senderId.role === 'buyer' ? msg.senderId : msg.receiverId,
          userB: msg.senderId.role === 'buyer' ? msg.receiverId : msg.senderId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          participants: [msg.senderId, msg.receiverId]
        });
        seen.add(conversationKey);
      }
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
