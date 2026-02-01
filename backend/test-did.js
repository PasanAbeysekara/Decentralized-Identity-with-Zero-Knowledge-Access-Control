const DID = require('./models/DID.model');
const { getContracts } = require('./config/blockchain');
const { uploadToIPFS } = require('./config/ipfs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDIDCreation() {
  try {
    console.log('Testing DID creation...');
    
    const controller = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const publicKey = '0x04e68acfc0253a10620dff706b0a1b1f1f5833ea3beb3bde2250d5f271f3563606672ebc45e0b7ea2e816ecb70ca03137b1c9476eec63d4632e990020b7b6fba39';
    
    const did = `did:ethr:${controller}`;
    
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      controller,
      publicKey: [{
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey
      }],
      authentication: [`${did}#key-1`],
      service: []
    };
    
    console.log('1. Testing IPFS upload...');
    const documentHash = await uploadToIPFS(didDocument);
    console.log('✅ IPFS upload successful:', documentHash);
    
    console.log('2. Testing blockchain connection...');
    const { didRegistry } = getContracts();
    console.log('✅ Contract loaded:', didRegistry.target);
    
    console.log('3. Testing MongoDB connection...');
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
    
    console.log('4. Creating DID in database...');
    const newDID = new DID({
      did,
      controller,
      documentHash,
      document: didDocument,
      publicKeys: didDocument.publicKey,
      authentication: didDocument.authentication,
      services: didDocument.service
    });
    
    await newDID.save();
    console.log('✅ DID saved to database');
    
    console.log('5. Registering on blockchain...');
    const tx = await didRegistry.createDID(did, documentHash);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', receipt.hash);
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDIDCreation();
