const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
const stripe = require('stripe')(stripeKey);
const Transaction = require('../../models/Transaction');
const Offer = require('../../models/Offer');
const socketManager = require('../../services/socketManager');

exports.capturePayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Only the buyer verifies the exchange to release escrow
    if (transaction.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to release these funds' });
    }

    if (transaction.status !== 'held') {
      return res.status(400).json({ message: 'Transaction is not currently held in escrow' });
    }

    // Capture the Stripe Payment Intent to finalize the charge
    const paymentIntent = await stripe.paymentIntents.capture(transaction.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      transaction.status = 'released';
      await transaction.save();

      const offer = await Offer.findById(transaction.offerId);
      if (offer) {
        offer.status = 'completed';
        await offer.save();
      }

      // Dispatch real-time Escrow Release alert to Seller
      try {
        const io = socketManager.getIO();
        io.to(transaction.sellerId.toString()).emit('payment_released', transaction);
      } catch (err) {
        console.error('Socket emission failed', err.message);
      }

      res.json(transaction);
    } else {
      res.status(400).json({ message: `Capture failed: ${paymentIntent.status}` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
