pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * Credential Ownership Circuit
 * Proves ownership of a credential without revealing the credential data
 */
template CredentialOwnership() {
    // Private inputs
    signal input credentialId;
    signal input holderDID;
    signal input issuerDID;
    signal input credentialType;
    signal input issuanceDate;
    signal input expirationDate;
    signal input secretKey;
    
    // Public inputs
    signal input credentialCommitment;
    signal input currentTimestamp;
    signal input requiredCredentialType;
    
    // Output
    signal output isValid;
    
    // Verify credential commitment
    component hasher = Poseidon(7);
    hasher.inputs[0] <== credentialId;
    hasher.inputs[1] <== holderDID;
    hasher.inputs[2] <== issuerDID;
    hasher.inputs[3] <== credentialType;
    hasher.inputs[4] <== issuanceDate;
    hasher.inputs[5] <== expirationDate;
    hasher.inputs[6] <== secretKey;
    
    // Ensure commitment matches
    credentialCommitment === hasher.out;
    
    // Verify credential type matches requirement
    signal typeMatch;
    typeMatch <== IsEqual()([credentialType, requiredCredentialType]);
    
    // Verify credential is not expired (if expiration is set)
    component notExpired = LessEqThan(64);
    notExpired.in[0] <== currentTimestamp;
    notExpired.in[1] <== expirationDate;
    
    // Check if expiration date is set (0 means no expiration)
    component hasExpiration = IsZero();
    hasExpiration.in <== expirationDate;
    
    // Valid if: type matches AND (no expiration OR not expired)
    signal expirationValid;
    expirationValid <== hasExpiration.out + notExpired.out;
    
    // Ensure at least one condition is true (OR operation)
    component expirationCheck = GreaterThan(8);
    expirationCheck.in[0] <== expirationValid;
    expirationCheck.in[1] <== 0;
    
    // Final validation
    signal temp;
    temp <== typeMatch * expirationCheck.out;
    isValid <== temp;
}

component main {public [credentialCommitment, currentTimestamp, requiredCredentialType]} = CredentialOwnership();
