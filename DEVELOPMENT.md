# Development Guide

## Project Structure

### Smart Contracts (`/contracts`)

The smart contracts are written in Solidity and manage on-chain identity and credential data.

#### DIDRegistry.sol
- Manages decentralized identifiers
- Stores DID documents (IPFS hashes)
- Handles public key management
- Supports service endpoints
- Implements controller transfer

#### CredentialRegistry.sol
- Issues verifiable credentials
- Manages credential lifecycle
- Handles revocation
- Implements credential schemas
- Role-based issuer management

#### ZKVerifier.sol
- Base contract for ZK proof verification
- Access control based on proofs
- Policy management
- Resource access tracking

### Zero-Knowledge Circuits (`/circuits`)

Circom circuits for generating and verifying zero-knowledge proofs.

#### ageVerification.circom
**Purpose**: Prove user is above a certain age without revealing birthdate

**Private Inputs**:
- birthYear, birthMonth, birthDay
- salt (for privacy)

**Public Inputs**:
- currentYear, currentMonth, currentDay
- minAge
- credentialHash

**Output**: Boolean (valid/invalid)

#### credentialOwnership.circom
**Purpose**: Prove ownership of a credential without revealing its contents

**Private Inputs**:
- credentialId, holderDID, issuerDID
- credentialType, dates, secretKey

**Public Inputs**:
- credentialCommitment
- currentTimestamp
- requiredCredentialType

#### membershipVerification.circom
**Purpose**: Prove membership in a group anonymously

**Uses Merkle trees** for efficient membership proofs

### Backend API (`/backend`)

Node.js/Express REST API for off-chain operations and database management.

#### Key Components:

1. **Models**: MongoDB schemas for DIDs, Credentials, ZK Proofs
2. **Routes**: API endpoints for all operations
3. **Config**: Blockchain connection, IPFS, database setup
4. **Middleware**: Error handling, validation, authentication

#### API Design Principles:
- RESTful architecture
- Input validation using express-validator
- Error handling middleware
- Rate limiting
- CORS configuration
- Request logging

### Frontend (`/frontend`)

Next.js 14 application with TypeScript and TailwindCSS.

#### Key Features:
- **Wallet Integration**: MetaMask connection via Ethers.js
- **State Management**: Zustand for wallet state
- **Data Fetching**: React Query for API calls
- **Routing**: Next.js App Router
- **Styling**: TailwindCSS with custom components
- **Toast Notifications**: React Hot Toast

#### Pages:
- `/`: Landing page with features
- `/did`: DID management
- `/credentials`: Credential issuance and viewing
- `/zkproof`: ZK proof generation
- `/access`: Access control management

## Development Workflow

### 1. Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy locally
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Circuit Development

```bash
cd circuits

# Compile circuit
circom myCircuit.circom --r1cs --wasm --sym -o build/

# Generate proving and verification keys
snarkjs groth16 setup build/myCircuit.r1cs pot.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="Contribution"

# Export verification key
snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json

# Generate Solidity verifier
snarkjs zkey export solidityverifier circuit_0001.zkey Verifier.sol
```

### 3. Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Test API endpoints
curl http://localhost:3001/health

# View logs
# Using morgan for HTTP request logging
```

### 4. Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## Testing

### Contract Tests

```javascript
describe("DIDRegistry", function () {
  it("Should create a new DID", async function () {
    const did = "did:ethr:0x123...";
    await didRegistry.createDID(did, "QmHash...");
    const result = await didRegistry.getDID(did);
    expect(result.active).to.be.true;
  });
});
```

### Circuit Tests

```javascript
const wasm = await wasm_tester("circuit.circom");
const input = { a: 1, b: 2 };
const witness = await wasm.calculateWitness(input);
await wasm.assertOut(witness, { c: 3 });
```

### API Tests

```javascript
const response = await request(app)
  .post('/api/did/create')
  .send({ controller: "0x123...", publicKey: "0xabc..." });
expect(response.status).toBe(201);
```

## Deployment Checklist

### Before Deployment:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Smart contracts audited (for mainnet)
- [ ] ZK circuits reviewed
- [ ] API rate limits configured
- [ ] Error handling tested
- [ ] Security review completed

### Testnet Deployment:

1. Configure `.env` with testnet RPC
2. Fund deployer account with testnet ETH
3. Deploy contracts: `npm run deploy:testnet`
4. Verify contracts on Etherscan
5. Update frontend with contract addresses
6. Deploy backend to staging server
7. Deploy frontend to Vercel/Netlify
8. Test end-to-end functionality

### Mainnet Deployment:

⚠️ **Exercise extreme caution!**

1. Complete security audit
2. Test thoroughly on testnet
3. Prepare emergency procedures
4. Deploy contracts with proper gas settings
5. Verify contracts immediately
6. Monitor transactions closely
7. Have rollback plan ready

## Best Practices

### Smart Contracts:
- Use OpenZeppelin libraries
- Follow checks-effects-interactions pattern
- Implement access control
- Use events for important state changes
- Consider gas optimization
- Add comprehensive NatSpec comments

### ZK Circuits:
- Keep circuits simple and auditable
- Use well-tested circomlib components
- Validate all constraints
- Test with edge cases
- Document circuit logic clearly

### Backend:
- Validate all inputs
- Use environment variables for secrets
- Implement proper error handling
- Log important operations
- Use connection pooling
- Implement caching where appropriate

### Frontend:
- Validate user inputs client-side
- Handle loading states
- Show clear error messages
- Implement optimistic updates
- Use TypeScript for type safety
- Follow accessibility guidelines

## Troubleshooting

### Common Issues:

1. **MetaMask not connecting**
   - Ensure MetaMask is installed
   - Check network configuration
   - Clear browser cache

2. **Circuit compilation fails**
   - Verify Circom installation
   - Check circuit syntax
   - Ensure all dependencies available

3. **Contract deployment fails**
   - Check account has sufficient funds
   - Verify RPC endpoint
   - Review gas settings

4. **Backend connection issues**
   - Verify MongoDB is running
   - Check environment variables
   - Review network configuration

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Circom Documentation](https://docs.circom.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

## Support

For development help:
- Check existing issues on GitHub
- Review documentation
- Join community Discord/Telegram
- Create detailed issue reports
