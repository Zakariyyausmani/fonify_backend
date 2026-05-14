const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0) // Normalize to start of day
  },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  chatRequests: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index for fast lookup and daily uniqueness per listing
analyticsSchema.index({ listingId: 1, date: 1 }, { unique: true });
analyticsSchema.index({ sellerId: 1, date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
