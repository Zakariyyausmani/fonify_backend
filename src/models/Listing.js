const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Used', 'For Parts'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  locationData: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  specifications: {
    storage: String,
    ram: String,
    battery: String,
    screenSize: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['not_verified', 'pending', 'verified', 'failed'],
    default: 'not_verified'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

listingSchema.index({ locationData: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
