# Decentralized Identity with Zero-Knowledge Access Control

A complete blockchain-based decentralized identity platform that enables users to prove identity attributes using zero-knowledge proofs without revealing underlying data. Built with Ethereum smart contracts, Circom ZK circuits, Node.js backend, and Next.js frontend.

## Features

- **Decentralized Identifiers (DIDs)**: Create and manage blockchain-based digital identities
- **Verifiable Credentials**: Issue, store, and verify credentials with cryptographic proofs
- **Zero-Knowledge Proofs**: Prove attributes without revealing sensitive data
  - Age verification
  - Credential ownership
  - Group membership
- **Privacy-Preserving Access Control**: Grant resource access based on ZK proofs
- **IPFS Integration**: Decentralized storage for DID documents and credentials
- **Smart Contract Infrastructure**: Solidity contracts on Ethereum/Polygon

## Architecture

```
├── contracts/              # Solidity smart contracts
│   ├── DIDRegistry.sol
│   ├── CredentialRegistry.sol
│   └── ZKVerifier.sol
├── circuits/               # Circom ZK proof circuits
│   ├── ageVerification.circom
│   ├── credentialOwnership.circom
│   └── membershipVerification.circom
├── backend/                # Node.js/Express API
│   ├── models/
│   ├── routes/
│   └── config/
├── frontend/               # Next.js React application
│   └── src/
└── scripts/                # Deployment and utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- MetaMask or compatible Web3 wallet
- Circom and SnarkJS (for ZK circuits)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PasanAbeysekara/Decentralized-Identity-with-Zero-Knowledge-Access-Control.git
cd Decentralized-Identity-with-Zero-Knowledge-Access-Control
```

2. **Install root dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

5. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

6. **Install circuit dependencies**
```bash
cd circuits
npm install
cd ..
```

### Development Setup

#### 1. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npm run node
```

#### 2. Deploy Smart Contracts

```bash
# Terminal 2: Deploy contracts
npm run deploy:local
```

#### 3. Compile ZK Circuits

```bash
# Compile and setup circuits (first time only)
npm run circuits:compile
npm run circuits:setup
```

#### 4. Start Backend API

```bash
# Terminal 3: Start backend server
npm run backend:dev
```

#### 5. Start Frontend

```bash
# Terminal 4: Start frontend development server
npm run frontend:dev
```

#### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## 📝 Usage Guide

### Creating a DID

1. Connect your MetaMask wallet
2. Navigate to "My DID" → "Create DID"
3. Enter your public key and optional services
4. Confirm the transaction
5. Your DID will be created and stored on-chain

### Issuing Credentials

1. Ensure you have ISSUER_ROLE permission
2. Navigate to "Credentials" → "Issue Credential"
3. Enter subject DID, credential type, and claims
4. Set expiration date (optional)
5. Sign and submit the transaction

### Generating Zero-Knowledge Proofs

#### Age Verification Example

```javascript
const proof = await zkProofAPI.ageVerification({
  birthYear: 1995,
  birthMonth: 5,
  birthDay: 15,
  salt: 12345,
  currentYear: 2026,
  currentMonth: 1,
  currentDay: 29,
  minAge: 18,
  credentialHash: "0x..."
});
```

### Requesting Access with ZK Proof

1. Generate a ZK proof for required attributes
2. Navigate to "Access Control" → "Request Access"
3. Select resource and upload proof
4. Submit request
5. Access granted if proof is valid

## 🧪 Testing

### Run Contract Tests

```bash
npm run test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Test Specific Contracts

```bash
npm run test:contracts
```

## 📦 Deployment

### Deploy to Testnet (Sepolia)

1. Configure testnet RPC and private key in `.env`:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key_here
```

2. Deploy contracts:
```bash
npm run deploy:testnet
```

3. Verify contracts on Etherscan:
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

### Deploy to Mainnet

**IMPORTANT**: Thoroughly test on testnets before mainnet deployment!

```bash
npm run deploy:mainnet
```

## Technology Stack

### Blockchain & Smart Contracts
- **Solidity ^0.8.24**: Smart contract development
- **Hardhat**: Development environment
- **OpenZeppelin**: Secure contract libraries
- **Ethers.js v6**: Ethereum interaction

### Zero-Knowledge Proofs
- **Circom 2.1.6**: Circuit design
- **SnarkJS 0.7.x**: Proof generation and verification
- **Groth16**: ZK proof protocol

### Backend
- **Node.js**: Runtime environment
- **Express.js**: REST API framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **IPFS**: Decentralized storage

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Zustand**: State management
- **React Query**: Data fetching
- **Ethers.js**: Web3 integration

## Security Considerations

1. **Private Key Management**: Never commit private keys. Use environment variables.
2. **ZK Circuit Auditing**: Circuits should be audited before production use.
3. **Smart Contract Security**: Contracts use OpenZeppelin libraries and follow best practices.
4. **API Rate Limiting**: Backend implements rate limiting to prevent abuse.
5. **Input Validation**: All user inputs are validated and sanitized.

## API Documentation

### DID Endpoints

- `POST /api/did/create` - Create new DID
- `GET /api/did/:did` - Resolve DID document
- `PUT /api/did/:did` - Update DID document
- `DELETE /api/did/:did` - Deactivate DID
- `GET /api/did/controller/:address` - Get DID by controller address

### Credential Endpoints

- `POST /api/credentials/issue` - Issue new credential
- `GET /api/credentials/:id` - Get credential by ID
- `GET /api/credentials/subject/:did` - Get credentials for subject
- `POST /api/credentials/:id/revoke` - Revoke credential
- `POST /api/credentials/verify` - Verify credential

### ZK Proof Endpoints

- `POST /api/zkproof/generate` - Generate ZK proof
- `POST /api/zkproof/verify` - Verify ZK proof
- `GET /api/zkproof/:id` - Get proof by ID
- `POST /api/zkproof/age-verification` - Helper for age verification

### Access Control Endpoints

- `POST /api/access/request` - Request resource access
- `GET /api/access/check/:requester/:resource` - Check access
- `POST /api/access/policy` - Create access policy
- `GET /api/access/policy/:id` - Get policy details

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Circom and SnarkJS teams for ZK proof tools
- Ethereum Foundation for blockchain infrastructure
- IPFS for decentralized storage

## Support

For questions and support:
- Create an issue in the GitHub repository
- Check the [documentation](./docs/)

## Roadmap

- [ ] Mobile application (React Native)
- [ ] Multi-signature DID control
- [ ] Credential delegation
- [ ] Selective disclosure credentials
- [ ] Integration with more ZK proof systems
- [ ] Cross-chain DID resolution
- [ ] Advanced access control policies
- [ ] Biometric credential support

---
