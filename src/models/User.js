const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'agent'],
    default: 'user'
  },
  currentMode: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  profileImage: {
    type: String,
    default: ''
  },
  cnic: {
    type: String,
    trim: true
  },
  cnicImages: {
    front: String,
    back: String
  },
  selfieImage: {
    type: String
  },
  city: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  identityVerificationStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },
  identityVerificationDetails: {
    type: Map,
    of: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isShopSetup: {
    type: Boolean,
    default: false
  },
  shopInfo: {
    storeName: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
