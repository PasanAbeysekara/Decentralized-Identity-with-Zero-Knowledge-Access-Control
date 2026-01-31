pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * Membership Verification Circuit
 * Proves membership in a group without revealing identity
 */
template MembershipVerification(groupSize) {
    // Private inputs
    signal input memberSecret;
    signal input memberIndex;
    
    // Public inputs
    signal input membershipRoot; // Merkle root of all members
    signal input groupId;
    signal input minMembershipDate;
    signal input membershipDate;
    
    // Merkle proof inputs (private)
    signal input merkleProof[groupSize];
    signal input merkleIndices[groupSize];
    
    // Output
    signal output isValid;
    
    // Verify membership date
    component dateCheck = GreaterEqThan(64);
    dateCheck.in[0] <== membershipDate;
    dateCheck.in[1] <== minMembershipDate;
    
    // Compute member commitment
    component memberHash = Poseidon(3);
    memberHash.inputs[0] <== memberSecret;
    memberHash.inputs[1] <== groupId;
    memberHash.inputs[2] <== membershipDate;
    
    // Verify Merkle proof
    signal currentHash[groupSize + 1];
    currentHash[0] <== memberHash.out;
    
    component hashers[groupSize];
    component selectors[groupSize];
    
    for (var i = 0; i < groupSize; i++) {
        selectors[i] = Selector();
        selectors[i].in[0] <== currentHash[i];
        selectors[i].in[1] <== merkleProof[i];
        selectors[i].index <== merkleIndices[i];
        
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].out[0];
        hashers[i].inputs[1] <== selectors[i].out[1];
        
        currentHash[i + 1] <== hashers[i].out;
    }
    
    // Verify root matches
    signal rootMatch;
    rootMatch <== IsEqual()([currentHash[groupSize], membershipRoot]);
    
    // Final validation: root matches AND date is valid
    isValid <== rootMatch * dateCheck.out;
}

// Helper: Selector for Merkle proof
template Selector() {
    signal input in[2];
    signal input index;
    signal output out[2];
    
    out[0] <== in[0] * (1 - index) + in[1] * index;
    out[1] <== in[1] * (1 - index) + in[0] * index;
}

component main {public [membershipRoot, groupId, minMembershipDate]} = MembershipVerification(8);
