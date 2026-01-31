# IPFS Configuration Guide

## Current Setup

The backend currently uses a **mock IPFS implementation** for development to avoid Node.js compatibility issues with the deprecated `ipfs-http-client` package.

## Production Options

### Option 1: Use Pinata (Recommended)

Pinata provides a hosted IPFS service that's reliable and easy to use.

1. **Sign up for Pinata**: https://www.pinata.cloud/
2. **Get API credentials** from your account dashboard
3. **Create `.env` file** in the backend directory:

```bash
# MongoDB (optional for basic testing)
MONGODB_URI=mongodb://localhost:27017/did-zk

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_NETWORK_ID=31337

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Pinata IPFS Configuration (RECOMMENDED FOR PRODUCTION)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

4. **Install Pinata SDK**:
```bash
npm install @pinata/sdk@2.1.0
```

5. **Restart the backend** - it will automatically use Pinata when credentials are provided.

### Option 2: Use Helia (Modern IPFS)

For a self-hosted solution, use Helia (the successor to ipfs-http-client):

1. **Install Helia packages**:
```bash
npm install helia @helia/unixfs
```

2. **Update `config/ipfs.js`** to use Helia:
```javascript
const { createHelia } = require('helia');
const { unixfs } = require('@helia/unixfs');

let heliaInstance = null;

const getIPFSClient = async () => {
  if (!heliaInstance) {
    heliaInstance = await createHelia();
  }
  const fs = unixfs(heliaInstance);
  return fs;
};
```

### Option 3: Run Local IPFS Node

1. **Install IPFS Desktop**: https://docs.ipfs.tech/install/ipfs-desktop/
2. **Start IPFS daemon**: `ipfs daemon`
3. **Configure CORS**:
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
```

## Current Mock Behavior

Without Pinata or a local IPFS node:
- **Upload**: Generates a mock CID based on content hash
- **Download**: Not implemented (throws error)
- **Warning**: Logs warning message about using mock storage

This is sufficient for:
- ✅ Development and testing
- ✅ Smart contract interactions
- ✅ DID creation workflows
- ❌ NOT for production use
- ❌ Cannot retrieve previously uploaded data

## Verifying IPFS is Working

```bash
# Test Pinata connection
curl -X POST https://api.pinata.cloud/data/testAuthentication \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY"

# Should return: {"message":"Congratulations! You are communicating with the Pinata API!"}
```

## Migration Path

1. **Development**: Use mock IPFS (current setup) ✅
2. **Testing**: Add Pinata credentials for realistic testing
3. **Production**: Must use Pinata or dedicated IPFS infrastructure

## Security Notes

- Never commit `.env` file with real credentials
- Use environment variables in production (Azure App Service, Heroku, etc.)
- Rotate API keys regularly
- Use Pinata's JWT-based authentication for enhanced security
