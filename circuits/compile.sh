#!/bin/bash

# Circom Circuit Compilation Script
echo "Starting Circom circuit compilation..."

# Create build directory
mkdir -p build

# Compile Age Verification Circuit
echo "Compiling Age Verification circuit..."
circom ageVerification.circom -r build/ageVerification.r1cs -w build/ageVerification.wasm -s build/ageVerification.sym
if [ $? -ne 0 ]; then
    echo "Error compiling ageVerification circuit"
    exit 1
fi

# Compile Credential Ownership Circuit
echo "Compiling Credential Ownership circuit..."
circom credentialOwnership.circom -r build/credentialOwnership.r1cs -w build/credentialOwnership.wasm -s build/credentialOwnership.sym
if [ $? -ne 0 ]; then
    echo "Error compiling credentialOwnership circuit"
    exit 1
fi

# Compile Membership Verification Circuit
echo "Compiling Membership Verification circuit..."
circom membershipVerification.circom -r build/membershipVerification.r1cs -w build/membershipVerification.wasm -s build/membershipVerification.sym
if [ $? -ne 0 ]; then
    echo "Error compiling membershipVerification circuit"
    exit 1
fi

echo "Circuit compilation completed successfully!"
echo "Generated files are in the build/ directory"

# Print circuit info
echo ""
echo "Circuit Information:"
snarkjs r1cs info build/ageVerification.r1cs
snarkjs r1cs info build/credentialOwnership.r1cs
snarkjs r1cs info build/membershipVerification.r1cs
