const { create } = require('ipfs-http-client');
const pinataSDK = require('@pinata/sdk');
require('dotenv').config();

// IPFS client
const getIPFSClient = () => {
  const host = process.env.IPFS_HOST || 'localhost';
  const port = process.env.IPFS_PORT || 5001;
  const protocol = process.env.IPFS_PROTOCOL || 'http';
  
  return create({
    host,
    port,
    protocol
  });
};

// Pinata client (alternative to local IPFS)
const getPinataClient = () => {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    return null;
  }
  
  return new pinataSDK(apiKey, secretKey);
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
    
    // Fallback to local IPFS
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
