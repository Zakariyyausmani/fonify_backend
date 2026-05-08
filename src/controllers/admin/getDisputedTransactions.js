const Transaction = require('../../models/Transaction');

const getDisputedTransactions = async (req, res) => {
  try {
    const disputes = await Transaction.find({ isDisputed: true })
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email profileImage')
      .populate('sellerId', 'name email profileImage')
      .populate('listingId', 'brand model price images');

    res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching disputes', error: error.message });
  }
};

module.exports = { getDisputedTransactions };
