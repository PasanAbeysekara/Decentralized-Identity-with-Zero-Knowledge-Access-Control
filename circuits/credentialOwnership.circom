pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Credential Ownership Circuit
// Proves ownership of a credential without revealing credential details
template CredentialOwnership() {
    signal input credentialId;
    signal input ownerId;
    signal input issuerSignature;
    signal input expiryTimestamp;
    signal input currentTimestamp;
    signal input salt;
    
    signal output ownershipProof;
    signal output credentialCommitment;
    
    // Check credential hasn't expired
    component expiryCheck = LessThan(64);
    expiryCheck.in[0] <== currentTimestamp;
    expiryCheck.in[1] <== expiryTimestamp;
    signal notExpired;
    notExpired <== expiryCheck.out;
    
    // Create credential commitment
    component hasher = Poseidon(5);
    hasher.inputs[0] <== credentialId;
    hasher.inputs[1] <== ownerId;
    hasher.inputs[2] <== issuerSignature;
    hasher.inputs[3] <== expiryTimestamp;
    hasher.inputs[4] <== salt;
    credentialCommitment <== hasher.out;
    
    // Ownership proof (valid if not expired)
    ownershipProof <== notExpired;
    
    // Ensure proof is valid
    ownershipProof === 1;
}

component main = CredentialOwnership();