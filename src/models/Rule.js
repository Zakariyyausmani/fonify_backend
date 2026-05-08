const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    enum: ['rules', 'signs'],
    default: 'rules'
  },
  province: {
    type: String,
    default: 'Punjab'
  },
  rule_no: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    default: null
  },
  fine_motorcycle: {
    type: String,
    default: null // Store "N/A" as null
  },
  fine_private_vehicle: {
    type: String,
    default: null
  },
  fine_public_vehicle: {
    type: String,
    default: null
  },
  points_deducted: {
    type: Number,
    default: 0
  },
  rule_code: {
    type: String,
    default: null
  },
  sign_meaning: {
    type: String,
    default: null
  },
  media_url: {
    type: String,
    default: null
  },
  extra_fields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
