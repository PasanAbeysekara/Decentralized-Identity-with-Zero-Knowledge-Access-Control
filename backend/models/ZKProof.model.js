const mongoose = require('mongoose');

const ZKProofSchema = new mongoose.Schema({
  proofId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  proofType: {
    type: String,
    enum: ['ageVerification', 'credentialOwnership', 'membershipVerification'],
    required: true,
    index: true
  },
  prover: {
    type: String,
    required: true,
    index: true
  },
  proof: {
    pi_a: [String],
    pi_b: [[String]],
    pi_c: [String],
    protocol: String,
    curve: String
  },
  publicSignals: [String],
  verificationResult: {
    type: Boolean,
    default: null
  },
  verifiedAt: Date,
  resourceId: String,
  metadata: Object,
  expiresAt: Date,
  created: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ZKProofSchema.index({ prover: 1, proofType: 1 });
ZKProofSchema.index({ created: -1 });

module.exports = mongoose.model('ZKProof', ZKProofSchema);
