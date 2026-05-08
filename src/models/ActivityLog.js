const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    index: true // Useful for filtering logs by action type
  },
  targetType: {
    type: String, // e.g., 'Listing', 'User', 'Report', 'Category'
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Object, // Store any additional context (e.g., changes made)
    default: {}
  }
}, { timestamps: true });

// Index for getting recent logs efficiently
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
