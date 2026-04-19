const Offer = require('../../models/Offer');
const Listing = require('../../models/Listing');
const Message = require('../../models/Message');
const socketManager = require('../../services/socketManager');

exports.createOffer = async (req, res) => {
  try {
    const { listingId, amount } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot make an offer on your own listing' });
    }

    const offer = new Offer({
      listingId,
      buyerId: req.user._id,
      sellerId: listing.seller,
      amount
    });

    const savedOffer = await offer.save();

    // Create a system message to show in the chat
    const message = new Message({
      senderId: req.user._id,
      receiverId: listing.seller,
      listingId,
      content: `I have made an offer of $${amount}.`,
      type: 'offer',
      offerId: savedOffer._id
    });
    const savedMessage = await message.save();

    // Real-time socket emission to the seller
    try {
      const io = socketManager.getIO();
      io.to(listing.seller.toString()).emit('new_offer', savedOffer);
      io.to(listing.seller.toString()).emit('receive_message', savedMessage);
    } catch (err) {
      console.error('Socket emission failed:', err.message);
    }

    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
