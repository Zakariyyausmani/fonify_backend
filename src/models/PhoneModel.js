const mongoose = require('mongoose');

const phoneModelSchema = new mongoose.Schema({
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
  specs: {
    storage: [String],
    ram: [String],
    battery: String,
    screenSize: String,
    colors: [String]
  },
  basePrice: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

phoneModelSchema.index({ brand: 1, model: 1 }, { unique: true });

module.exports = mongoose.model('PhoneModel', phoneModelSchema);
