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
      required: false
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
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredExpiry: {
    type: Date,
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['not_verified', 'pending', 'verified', 'failed'],
    default: 'not_verified'
  },
  views: {
    type: Number,
    default: 0
  },
  imei: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null/undefined values but enforces uniqueness for non-null
  },
  imeiVerificationResult: {
    isValid: Boolean,
    brand: String,
    model: String,
    blacklistStatus: String,
    rawResponse: Object
  }
}, {
  timestamps: true
});

listingSchema.index({ locationData: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
