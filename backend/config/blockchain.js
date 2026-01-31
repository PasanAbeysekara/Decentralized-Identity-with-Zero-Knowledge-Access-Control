const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (will be imported from artifacts)
const DIDRegistryABI = require('../../artifacts/contracts/DIDRegistry.sol/DIDRegistry.json').abi;
const CredentialRegistryABI = require('../../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json').abi;
const ZKAccessControlABI = require('../../artifacts/contracts/ZKVerifier.sol/ZKAccessControl.json').abi;

// Provider setup
const getProvider = () => {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Signer setup
const getSigner = () => {
  const provider = getProvider();
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key not found in environment variables');
  }
  return new ethers.Wallet(privateKey, provider);
};

// Contract instances
const getContracts = () => {
  const signer = getSigner();
  
  const didRegistry = new ethers.Contract(
    process.env.DID_REGISTRY_ADDRESS,
    DIDRegistryABI,
    signer
  );
  
  const credentialRegistry = new ethers.Contract(
    process.env.CREDENTIAL_REGISTRY_ADDRESS,
    CredentialRegistryABI,
    signer
  );
  
  const zkAccessControl = new ethers.Contract(
    process.env.ZK_ACCESS_CONTROL_ADDRESS,
    ZKAccessControlABI,
    signer
  );
  
  return { didRegistry, credentialRegistry, zkAccessControl };
};

module.exports = {
  getProvider,
  getSigner,
  getContracts,
  DIDRegistryABI,
  CredentialRegistryABI,
  ZKAccessControlABI
};
