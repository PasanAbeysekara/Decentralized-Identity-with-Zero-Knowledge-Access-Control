const mongoose = require('mongoose');

const DIDSchema = new mongoose.Schema({
  did: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  controller: {
    type: String,
    required: true,
    index: true
  },
  documentHash: {
    type: String,
    required: true
  },
  document: {
    type: Object,
    required: true
  },
  publicKeys: [{
    id: String,
    type: String,
    controller: String,
    publicKeyHex: String,
    created: Date,
    revoked: { type: Boolean, default: false }
  }],
  authentication: [String],
  services: [{
    id: String,
    type: String,
    serviceEndpoint: String
  }],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  onChain: {
    type: Boolean,
    default: false
  },
  transactionHash: String
}, {
  timestamps: true
});

DIDSchema.index({ controller: 1, active: 1 });

module.exports = mongoose.model('DID', DIDSchema);
