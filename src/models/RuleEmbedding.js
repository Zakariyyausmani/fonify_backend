const mongoose = require('mongoose');

const ruleEmbeddingSchema = new mongoose.Schema({
  rule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rule',
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    enum: ['rules', 'signs']
  },
  embedding: {
    type: [Number], // array of floats
    required: true
  }
}, { timestamps: true });

// Optional: If using Atlas Vector Search, you'd define the index in the dashboard.
// For manual similarity, this index is enough for rule_id lookups.

module.exports = mongoose.model('RuleEmbedding', ruleEmbeddingSchema);
