# Zero-Knowledge Circuits

This directory contains Circom circuits for zero-knowledge proofs used in the decentralized identity system.

## Circuits

### 1. Age Verification (`ageVerification.circom`)
Proves that a user is above a certain age without revealing their actual birthdate.

**Private Inputs:**
- birthYear, birthMonth, birthDay
- salt (for privacy)

**Public Inputs:**
- currentYear, currentMonth, currentDay
- minAge
- credentialHash

### 2. Credential Ownership (`credentialOwnership.circom`)
Proves ownership of a credential without revealing the credential data.

**Private Inputs:**
- credentialId, holderDID, issuerDID
- credentialType, issuanceDate, expirationDate
- secretKey

**Public Inputs:**
- credentialCommitment
- currentTimestamp
- requiredCredentialType

### 3. Membership Verification (`membershipVerification.circom`)
Proves membership in a group without revealing identity.

**Private Inputs:**
- memberSecret, memberIndex
- merkleProof, merkleIndices

**Public Inputs:**
- membershipRoot (Merkle root)
- groupId
- minMembershipDate

## Setup Instructions

### Prerequisites
```bash
# Install Circom
npm install -g circom

# Install SnarkJS
npm install -g snarkjs

# Install dependencies
npm install
```

### Compilation
```bash
# Make scripts executable
chmod +x compile.sh setup.sh

# Compile circuits
npm run compile
```

### Trusted Setup
```bash
# Generate proving and verification keys
npm run setup
```

This will:
1. Download Powers of Tau ceremony file
2. Generate zKeys for each circuit
3. Export Solidity verifier contracts
4. Move verifiers to contracts directory

## Usage

### Generate Proof (JavaScript)
```javascript
const snarkjs = require('snarkjs');

// Load circuit files
const wasmFile = './build/ageVerification_js/ageVerification.wasm';
const zkeyFile = './build/ageVerification_0001.zkey';

// Prepare inputs
const input = {
  birthYear: 1990,
  birthMonth: 5,
  birthDay: 15,
  salt: 12345,
  currentYear: 2026,
  currentMonth: 1,
  currentDay: 29,
  minAge: 18,
  credentialHash: "0x..."
};

// Generate proof
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  wasmFile,
  zkeyFile
);

// Export for Solidity
const calldata = await snarkjs.groth16.exportSolidityCallData(
  proof,
  publicSignals
);
```

## Circuit Files

After compilation and setup:
- `build/*.r1cs` - Rank-1 Constraint System
- `build/*.wasm` - WebAssembly for proof generation
- `build/*.zkey` - Proving keys
- `build/*_verification_key.json` - Verification keys
- `contracts/*Verifier.sol` - Solidity verifier contracts
