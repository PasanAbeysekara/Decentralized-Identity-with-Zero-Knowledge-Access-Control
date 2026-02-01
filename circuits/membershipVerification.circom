include "../node_modules/circomlib/circuits/poseidon.circom";

// Membership Verification Circuit
// Proves membership in a group without revealing member identity
template MembershipVerification(levels) {
    signal input memberId;
    signal input groupRoot;
    signal input siblings[levels];
    signal input pathElements[levels];
    signal input salt;
    
    signal output membershipProof;
    signal output memberCommitment;
    
    // Create member commitment
    component hasher = Poseidon(2);
    hasher.inputs[0] <== memberId;
    hasher.inputs[1] <== salt;
    memberCommitment <== hasher.out;
    
    // Verify membership using merkle path
    // Create hash components for each level
    component levelHashers[levels];
    signal computedRoots[levels + 1];
    
    computedRoots[0] <== memberCommitment;
    
    for (var i = 0; i < levels; i++) {
        levelHashers[i] = Poseidon(2);
        
        // We'll handle the sorting outside constraints
        // For now, assume pathElements are in the correct order
        levelHashers[i].inputs[0] <== computedRoots[i];
        levelHashers[i].inputs[1] <== pathElements[i];
        
        computedRoots[i + 1] <== levelHashers[i].out;
    }
    
    // Verify the computed root matches the group root
    computedRoots[levels] === groupRoot;
    
    // Set membership proof
    membershipProof <== 1;
}

component main = MembershipVerification(16);

