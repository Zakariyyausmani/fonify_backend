const Message = require('../models/Message');
const socketManager = require('../services/socketManager');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, content } = req.body;

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      listingId,
      content
    });

    const savedMessage = await message.save();

    // Real-time socket emission
    try {
      const io = socketManager.getIO();
      // Emit to receiver's personal room
      io.to(receiverId).emit('receive_message', savedMessage);
    } catch (socketError) {
      console.error('Socket emission failed:', socketError.message);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a specific conversation (listing + user pair)
// @route   GET /api/messages/:listingId/:otherUserId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;

    const messages = await Message.find({
      listingId,
      $or: [
        { senderId: req.user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).populate('listingId', 'brand model images price')
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: -1 });

    // Group by listingId and the other user
    const conversations = [];
    const seen = new Set();

    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue; // Safety guard for deleted users

      const otherUser = msg.senderId._id.toString() === req.user._id.toString() ? msg.receiverId : msg.senderId;
      const safeListingId = msg.listingId ? msg.listingId._id.toString() : '000000000000000000000000';
      const conversationKey = `${safeListingId}_${otherUser._id.toString()}`;

      if (!seen.has(conversationKey)) {
        conversations.push({
          listing: msg.listingId || { brand: 'Platform', model: 'Support Chat', price: 0 },
          otherUser: otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          listingId: safeListingId,
          otherUserId: otherUser._id
        });
        seen.add(conversationKey);
      }
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
