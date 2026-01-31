# Testing Guide - Decentralized Identity with ZK Access Control

## 🧪 Quick Test - Is Everything Working?

Follow these steps to verify your implementation:

## Step 1: Install Dependencies

```powershell
# Root dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

# Circuit dependencies
cd circuits
npm install
cd ..
```

## Step 2: Start Local Blockchain

Open **Terminal 1** (PowerShell):
```powershell
# Start Hardhat local node
npx hardhat node
```

You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## Step 3: Deploy Smart Contracts

Open **Terminal 2** (PowerShell):
```powershell
# Deploy contracts to local network
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
🚀 Starting deployment...
✅ DIDRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ CredentialRegistry deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ ZKAccessControl deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**Important**: Copy the contract addresses from the output!

## Step 4: Update Backend Configuration

Create `.env` file in the root directory:
```powershell
# Copy example
cp .env.example .env
```

Edit the `.env` file with your deployed contract addresses:
```env
# From deployment output
DID_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CREDENTIAL_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ZK_ACCESS_CONTROL_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Local blockchain
RPC_URL=http://127.0.0.1:8545

# Use one of the Hardhat test accounts
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Backend
PORT=3001
MONGODB_URI=mongodb://localhost:27017/did_zk_db

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=31337
```

## Step 5: Start MongoDB (Optional for Basic Testing)

If you have MongoDB installed:
```powershell
# Start MongoDB service
mongod
```

Or use Docker:
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Note**: Backend will work without MongoDB for blockchain operations, but credential/DID storage won't persist.

## Step 6: Start Backend API

Open **Terminal 3** (PowerShell):
```powershell
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 3001
✅ MongoDB Connected (if MongoDB is running)
📡 Health check: http://localhost:3001/health
```

Test the API:
```powershell
curl http://localhost:3001/health
```

## Step 7: Start Frontend

Open **Terminal 4** (PowerShell):
```powershell
cd frontend
npm run dev
```

Expected output:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

## Step 8: Test in Browser

1. **Open Browser**: http://localhost:3000
2. **Install MetaMask** (if not already installed)
3. **Connect to Local Network**:
   - Open MetaMask
   - Click network dropdown → "Add Network" → "Add Network Manually"
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

4. **Import Test Account**:
   - Copy a private key from Hardhat node output (Terminal 1)
   - MetaMask → Import Account → Paste private key
   - Example key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

5. **Connect Wallet**:
   - Click "Connect Wallet" button on the app
   - Approve connection in MetaMask

## 🧪 Testing Smart Contracts

### Run Contract Tests

```powershell
# Run all tests
npx hardhat test

# Run with coverage
npx hardhat coverage

# Run specific test file
npx hardhat test test/DIDRegistry.test.js
```

Expected output:
```
  DIDRegistry
    DID Creation
      ✓ Should create a new DID
      ✓ Should not allow duplicate DIDs
      ✓ Should not allow empty DID
    DID Updates
      ✓ Should update DID document
      ✓ Should only allow controller to update
    ...

  15 passing (2s)
```

### Manual Contract Testing (Hardhat Console)

```powershell
npx hardhat console --network localhost
```

In the console:
```javascript
// Get deployed contract
const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
const didRegistry = await DIDRegistry.attach("YOUR_DEPLOYED_ADDRESS");

// Create a DID
const [signer] = await ethers.getSigners();
const did = `did:ethr:${signer.address}`;
const tx = await didRegistry.createDID(did, "QmTestHash123");
await tx.wait();

// Query DID
const result = await didRegistry.getDID(did);
console.log("DID Info:", result);
```

## 🔐 Testing Zero-Knowledge Circuits

**Note**: ZK circuit compilation requires additional tools. For quick testing, skip this initially.

### Install Circom (if needed)

```powershell
# Install Circom compiler
# Download from: https://docs.circom.io/getting-started/installation/

# Or use npm (may not work on all systems)
npm install -g circom
```

### Compile Circuits

```powershell
cd circuits

# Make scripts executable (Git Bash or WSL on Windows)
chmod +x compile.sh setup.sh

# Compile circuits
./compile.sh

# Or manually
circom ageVerification.circom --r1cs --wasm --sym -o build/
```

## 🌐 Testing API Endpoints

### Test DID Creation

```powershell
# Create DID
curl -X POST http://localhost:3001/api/did/create `
  -H "Content-Type: application/json" `
  -d '{
    "controller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "publicKey": "0x04abc123..."
  }'
```

### Test DID Resolution

```powershell
curl http://localhost:3001/api/did/did:ethr:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Test Health Check

```powershell
curl http://localhost:3001/health
```

## 🎯 End-to-End Test Workflow

### Complete User Journey Test:

1. **Create DID**
   - Open http://localhost:3000
   - Connect wallet
   - Navigate to "My DID" → "Create DID"
   - Fill form and submit
   - Check transaction in MetaMask
   - Verify DID created

2. **Issue Credential**
   - Navigate to "Credentials" → "Issue"
   - Enter subject DID and claims
   - Submit transaction
   - Verify credential created

3. **Generate ZK Proof**
   - Navigate to "ZK Proofs"
   - Select proof type (e.g., Age Verification)
   - Input private data
   - Generate proof
   - Verify proof is valid

4. **Request Access**
   - Navigate to "Access Control"
   - Select resource
   - Upload/use generated proof
   - Submit access request
   - Verify access granted

## 🐛 Troubleshooting

### Issue: "Cannot connect to blockchain"
**Solution**: Ensure Hardhat node is running (Terminal 1)
```powershell
npx hardhat node
```

### Issue: "Contract not found"
**Solution**: Deploy contracts and update addresses in `.env`
```powershell
npx hardhat run scripts/deploy.js --network localhost
```

### Issue: "MetaMask transaction failed"
**Solution**: 
- Check you're on the correct network (Chain ID 31337)
- Account has ETH (use Hardhat test accounts)
- Reset MetaMask account (Settings → Advanced → Reset Account)

### Issue: "MongoDB connection failed"
**Solution**: 
- Start MongoDB: `mongod`
- Or comment out MongoDB routes temporarily
- Backend will still work for blockchain operations

### Issue: "Port already in use"
**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F

# Or change port in .env
```

### Issue: "Circuit files not found"
**Solution**: Circuits are optional for initial testing. Skip ZK proof features or compile circuits:
```powershell
cd circuits
npm run compile
```

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Hardhat node shows "Account #0" with balance
- ✅ Contracts deploy without errors
- ✅ Backend shows "Server running on port 3001"
- ✅ Frontend loads at http://localhost:3000
- ✅ MetaMask connects successfully
- ✅ DID creation transaction succeeds
- ✅ API health check returns `{"status":"OK"}`
- ✅ Contract tests pass

## 📊 Test Checklist

- [ ] Dependencies installed
- [ ] Hardhat node running
- [ ] Contracts deployed
- [ ] Backend API running
- [ ] Frontend running
- [ ] MetaMask connected
- [ ] Test account imported
- [ ] DID created successfully
- [ ] Credential issued
- [ ] API responding
- [ ] Contract tests passing

## 🚀 Next Steps After Testing

1. **Write More Tests**: Add comprehensive test coverage
2. **Test on Testnet**: Deploy to Sepolia or Mumbai
3. **Security Audit**: Review contracts for vulnerabilities
4. **Performance Testing**: Load test API endpoints
5. **User Testing**: Get feedback on UI/UX

## 📝 Test Data

Use these test values:

**Test DIDs**:
- `did:ethr:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- `did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

**Test Credentials**:
```json
{
  "credentialType": "AgeCredential",
  "claims": {
    "age": 25,
    "country": "USA"
  }
}
```

**Test Accounts** (Hardhat default):
- Account #0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

---

**Need Help?** Check the logs in each terminal for error messages!
