const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'listing_approved', 'listing_rejected', 'verification_ready', 'verification_approved', 'verification_rejected', 'system'],
    default: 'system'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId // e.g., listingId or messageId
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
