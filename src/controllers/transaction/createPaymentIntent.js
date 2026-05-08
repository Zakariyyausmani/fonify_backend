const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
const stripe = require('stripe')(stripeKey);
const Offer = require('../../models/Offer');
const Transaction = require('../../models/Transaction');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { offerId } = req.body;

    const offer = await Offer.findById(offerId).populate('listingId');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to checkout this offer' });
    }

    if (offer.status !== 'accepted') {
      return res.status(400).json({ message: 'Offer is not in an accepted state' });
    }

    // Platform logic: Admin takes fixed 5% commission on completed sales
    const ADMIN_FEE_PERCENTAGE = 0.05;
    const adminFee = offer.amount * ADMIN_FEE_PERCENTAGE;
    const sellerPayout = offer.amount - adminFee;

    // Create a PaymentIntent in "manual capture" mode to simulate Escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(offer.amount * 100), // usd cents
      currency: 'usd',
      metadata: {
        offerId: offer._id.toString(),
        listingId: offer.listingId._id.toString(),
        buyerId: offer.buyerId.toString(),
        sellerId: offer.sellerId.toString(),
      },
      capture_method: 'manual',
    });

    const transaction = new Transaction({
      offerId: offer._id,
      listingId: offer.listingId._id,
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      totalAmount: offer.amount,
      adminFee,
      sellerPayout,
      stripePaymentIntentId: paymentIntent.id,
      status: 'held'
    });

    await transaction.save();

    offer.status = 'payment_pending';
    await offer.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
