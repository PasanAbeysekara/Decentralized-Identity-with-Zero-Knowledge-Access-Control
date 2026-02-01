#!/bin/bash

# ZK Proof Setup Script (Powers of Tau and zKey generation)
echo "Starting ZK proof trusted setup..."

# Create build directory if it doesn't exist
mkdir -p build
cd build

# Download Powers of Tau (or use existing)
echo "Downloading Powers of Tau file..."
if [ ! -f powersOfTau28_hez_final_14.ptau ]; then
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
fi

# Setup Age Verification Circuit
echo "Setting up Age Verification circuit..."
snarkjs groth16 setup ageVerification.r1cs powersOfTau28_hez_final_14.ptau ageVerification_0000.zkey
snarkjs zkey contribute ageVerification_0000.zkey ageVerification_0001.zkey --name="Contribution 1" -v -e="random entropy"
snarkjs zkey export verificationkey ageVerification_0001.zkey ageVerification_verification_key.json
snarkjs zkey export solidityverifier ageVerification_0001.zkey AgeVerifier.sol

# Setup Credential Ownership Circuit
echo "Setting up Credential Ownership circuit..."
snarkjs groth16 setup credentialOwnership.r1cs powersOfTau28_hez_final_14.ptau credentialOwnership_0000.zkey
snarkjs zkey contribute credentialOwnership_0000.zkey credentialOwnership_0001.zkey --name="Contribution 1" -v -e="random entropy"
snarkjs zkey export verificationkey credentialOwnership_0001.zkey credentialOwnership_verification_key.json
snarkjs zkey export solidityverifier credentialOwnership_0001.zkey CredentialVerifier.sol

# Setup Membership Verification Circuit
echo "Setting up Membership Verification circuit..."
snarkjs groth16 setup membershipVerification.r1cs powersOfTau28_hez_final_14.ptau membershipVerification_0000.zkey
snarkjs zkey contribute membershipVerification_0000.zkey membershipVerification_0001.zkey --name="Contribution 1" -v -e="random entropy"
snarkjs zkey export verificationkey membershipVerification_0001.zkey membershipVerification_verification_key.json
snarkjs zkey export solidityverifier membershipVerification_0001.zkey MembershipVerifier.sol

# Move Solidity verifiers to contracts directory
echo "Moving Solidity verifiers to contracts directory..."
mv AgeVerifier.sol ../../contracts/
mv CredentialVerifier.sol ../../contracts/
mv MembershipVerifier.sol ../../contracts/

cd ..
echo "ZK proof setup completed successfully!"
echo "Verifier contracts have been generated in the contracts/ directory"
