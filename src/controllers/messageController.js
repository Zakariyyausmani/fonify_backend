const Message = require('../models/Message');

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
      const otherUser = msg.senderId._id.toString() === req.user._id.toString() ? msg.receiverId : msg.senderId;
      const conversationKey = `${msg.listingId._id}_${otherUser._id}`;

      if (!seen.has(conversationKey)) {
        conversations.push({
          listing: msg.listingId,
          otherUser: otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          listingId: msg.listingId._id,
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
