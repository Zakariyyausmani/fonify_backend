const Transaction = require('../../models/Transaction');

exports.getFinancials = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$totalAmount" },
          totalEscrowHeld: {
            $sum: { $cond: [{ $eq: ["$status", "held"] }, "$totalAmount", 0] }
          },
          totalAdminEarnings: {
            $sum: { $cond: [{ $eq: ["$status", "released"] }, "$adminFee", 0] }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalVolume: 0,
        totalEscrowHeld: 0,
        totalAdminEarnings: 0,
        transactionCount: 0
      });
    }

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
