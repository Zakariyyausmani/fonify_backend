const Offer = require('../../models/Offer');
const Message = require('../../models/Message');
const socketManager = require('../../services/socketManager');

exports.respondOffer = async (req, res) => {
  try {
    const { offerId, response } = req.body; // 'accepted' or 'rejected'

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this offer' });
    }

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response status' });
    }

    offer.status = response;
    const updatedOffer = await offer.save();

    // Create a system message for the response
    const message = new Message({
      senderId: req.user._id,
      receiverId: offer.buyerId,
      listingId: offer.listingId,
      content: `I have ${response} your offer.`,
      type: 'offer_response',
      offerId: updatedOffer._id
    });
    const savedMessage = await message.save();

    // Notify buyer instantly
    try {
      const io = socketManager.getIO();
      io.to(offer.buyerId.toString()).emit('offer_response', updatedOffer);
      io.to(offer.buyerId.toString()).emit('receive_message', savedMessage);
    } catch (err) {
      console.error('Socket emission failed', err.message);
    }

    res.json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
