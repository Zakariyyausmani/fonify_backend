const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  adminFee: {
    type: Number,
    required: true
  },
  sellerPayout: {
    type: Number,
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['held', 'released', 'refunded'],
    default: 'held' // Funds initially held in Escrow
  },
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
