const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
  credentialId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  credentialHash: {
    type: String,
    required: true
  },
  type: {
    type: [String],
    required: true
  },
  issuer: {
    did: { type: String, required: true, index: true },
    address: { type: String, required: true }
  },
  credentialSubject: {
    id: { type: String, required: true, index: true }, // Subject DID
    claims: { type: Object, required: true }
  },
  issuanceDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date
  },
  proof: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'suspended', 'expired'],
    default: 'active',
    index: true
  },
  metadataURI: String,
  onChain: {
    type: Boolean,
    default: false
  },
  transactionHash: String,
  revocationDate: Date,
  revocationReason: String
}, {
  timestamps: true
});

CredentialSchema.index({ 'issuer.did': 1, status: 1 });
CredentialSchema.index({ 'credentialSubject.id': 1, status: 1 });

// Check if credential is valid
CredentialSchema.methods.isValid = function() {
  if (this.status === 'revoked' || this.status === 'suspended') {
    return false;
  }
  if (this.expirationDate && this.expirationDate < new Date()) {
    return false;
  }
  return true;
};

module.exports = mongoose.model('Credential', CredentialSchema);
