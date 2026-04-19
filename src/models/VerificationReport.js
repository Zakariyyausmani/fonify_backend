const mongoose = require('mongoose');

const verificationReportSchema = new mongoose.Schema({
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
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['requested', 'assigned', 'negotiating', 'meeting_scheduled', 'completed', 'cancelled'],
    default: 'requested'
  },
  negotiatedRate: {
    type: String
  },
  meetingPoint: {
    type: String
  },
  checks: {
    imeiStatus: String,
    displayCondition: String,
    batteryHealth: String,
    cameraCondition: String,
    physicalDamage: String,
    audioCondition: String,
    networkConnectivity: String
  },
  comments: String,
  reportImages: [String],
  scheduledDate: Date,
  completedDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('VerificationReport', verificationReportSchema);
