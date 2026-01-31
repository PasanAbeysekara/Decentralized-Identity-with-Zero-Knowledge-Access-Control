// Note: ipfs-http-client is deprecated. Using mock implementation for development.
// For production, consider using Helia or Pinata API directly.
require('dotenv').config();

// Mock IPFS client for development (avoids Node.js compatibility issues)
const getIPFSClient = () => {
  return {
    add: async (content) => {
      // Generate a mock CID based on content hash
      const hash = require('crypto')
        .createHash('sha256')
        .update(content)
        .digest('hex')
        .substring(0, 46);
      return { path: `Qm${hash}` };
    },
    cat: async (cid) => {
      // Mock retrieval - in production, this would fetch from IPFS
      throw new Error('IPFS cat not implemented in mock mode. Use Pinata or configure IPFS node.');
    }
  };
};

// Pinata client (alternative to local IPFS)
const getPinataClient = () => {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    return null;
  }
  
  try {
    const pinataSDK = require('@pinata/sdk');
    return new pinataSDK(apiKey, secretKey);
  } catch (error) {
    console.warn('Pinata SDK not available:', error.message);
    return null;
  }
};

// Upload to IPFS
const uploadToIPFS = async (data) => {
  try {
    // Try Pinata first if configured
    const pinata = getPinataClient();
    if (pinata) {
      const result = await pinata.pinJSONToIPFS(data);
      return result.IpfsHash;
    }
    
    // Fallback to mock IPFS (for development)
    console.warn('⚠️  Using mock IPFS storage. Configure Pinata for production.');
    const ipfs = getIPFSClient();
    const result = await ipfs.add(JSON.stringify(data));
    return result.path;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
};

// Retrieve from IPFS
const retrieveFromIPFS = async (hash) => {
  try {
    const ipfs = getIPFSClient();
    const chunks = [];
    
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    
    const data = Buffer.concat(chunks).toString();
    return JSON.parse(data);
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
};

module.exports = {
  getIPFSClient,
  getPinataClient,
  uploadToIPFS,
  retrieveFromIPFS
};
