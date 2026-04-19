const Transaction = require('../../models/Transaction');
const ActivityLog = require('../../models/ActivityLog');

const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'release' or 'refund'

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (action === 'release') {
      // Release funds to seller
      transaction.status = 'completed';
      transaction.isDisputed = false;
      transaction.disputeReason = null;
    } else if (action === 'refund') {
      // Refund to buyer — mark as refunded
      transaction.status = 'refunded';
      transaction.isDisputed = false;
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "release" or "refund".' });
    }

    await transaction.save();

    // Log the resolution
    await ActivityLog.create({
      adminId: req.user._id,
      action: `dispute_${action}`,
      targetType: 'Transaction',
      targetId: transaction._id,
    });

    res.status(200).json({ success: true, message: `Dispute resolved by ${action}.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error resolving dispute', error: error.message });
  }
};

module.exports = { resolveDispute };
