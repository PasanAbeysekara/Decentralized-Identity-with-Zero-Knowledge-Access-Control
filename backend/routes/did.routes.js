const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const DID = require('../models/DID.model');
const { getContracts } = require('../config/blockchain');
const { uploadToIPFS, retrieveFromIPFS } = require('../config/ipfs');
const { ethers } = require('ethers');

// Validation middleware
const validateDIDCreation = [
  body('controller').isEthereumAddress().withMessage('Invalid Ethereum address'),
  body('publicKey').notEmpty().withMessage('Public key is required'),
  body('authentication').optional().isArray(),
  body('services').optional().isArray()
];

/**
 * @route   POST /api/did/create
 * @desc    Create a new DID
 * @access  Public
 */
router.post('/create', validateDIDCreation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { controller, publicKey, authentication, services } = req.body;

    // Generate DID
    const did = `did:ethr:${controller}`;

    // Check if DID already exists
    const existingDID = await DID.findOne({ did });
    if (existingDID) {
      return res.status(400).json({ error: 'DID already exists' });
    }

    // Create DID document
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
      authentication: authentication || [`${did}#key-1`],
      service: services || []
    };

    // Upload to IPFS
    const documentHash = await uploadToIPFS(didDocument);

    // Save to database
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

    // Register on blockchain
    try {
      const { didRegistry } = getContracts();
      const tx = await didRegistry.createDID(did, documentHash);
      const receipt = await tx.wait();

      newDID.onChain = true;
      newDID.transactionHash = receipt.hash;
      await newDID.save();
    } catch (blockchainError) {
      console.error('Blockchain registration failed:', blockchainError);
      // DID is saved in database but not on-chain
    }

    res.status(201).json({
      success: true,
      did: newDID.did,
      document: newDID.document,
      documentHash: newDID.documentHash,
      onChain: newDID.onChain,
      transactionHash: newDID.transactionHash
    });

  } catch (error) {
    console.error('DID creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Failed to create DID', details: error.message });
  }
});

/**
 * @route   GET /api/did/:did
 * @desc    Resolve a DID document
 * @access  Public
 */
router.get('/:did', async (req, res) => {
  try {
    const { did } = req.params;

    const didDoc = await DID.findOne({ did, active: true });
    
    if (!didDoc) {
      return res.status(404).json({ error: 'DID not found' });
    }

    res.json({
      success: true,
      didDocument: didDoc.document,
      metadata: {
        created: didDoc.created,
        updated: didDoc.updated,
        onChain: didDoc.onChain,
        documentHash: didDoc.documentHash
      }
    });

  } catch (error) {
    console.error('DID resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve DID' });
  }
});

/**
 * @route   PUT /api/did/:did
 * @desc    Update DID document
 * @access  Private (controller only)
 */
router.put('/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const { controller, services, publicKeys } = req.body;

    const didDoc = await DID.findOne({ did, active: true });
    
    if (!didDoc) {
      return res.status(404).json({ error: 'DID not found' });
    }

    // Verify controller
    if (didDoc.controller.toLowerCase() !== controller.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Not the DID controller' });
    }

    // Update document
    if (services) {
      didDoc.services = services;
      didDoc.document.service = services;
    }

    if (publicKeys) {
      didDoc.publicKeys = publicKeys;
      didDoc.document.publicKey = publicKeys;
    }

    didDoc.updated = new Date();
    didDoc.document.updated = new Date().toISOString();

    // Upload updated document to IPFS
    const newDocumentHash = await uploadToIPFS(didDoc.document);
    didDoc.documentHash = newDocumentHash;

    await didDoc.save();

    // Update on blockchain
    try {
      const { didRegistry } = getContracts();
      const tx = await didRegistry.updateDID(did, newDocumentHash);
      await tx.wait();
    } catch (blockchainError) {
      console.error('Blockchain update failed:', blockchainError);
    }

    res.json({
      success: true,
      message: 'DID updated successfully',
      documentHash: newDocumentHash
    });

  } catch (error) {
    console.error('DID update error:', error);
    res.status(500).json({ error: 'Failed to update DID' });
  }
});

/**
 * @route   DELETE /api/did/:did
 * @desc    Deactivate a DID
 * @access  Private (controller only)
 */
router.delete('/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const { controller } = req.body;

    const didDoc = await DID.findOne({ did, active: true });
    
    if (!didDoc) {
      return res.status(404).json({ error: 'DID not found' });
    }

    // Verify controller
    if (didDoc.controller.toLowerCase() !== controller.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Not the DID controller' });
    }

    didDoc.active = false;
    await didDoc.save();

    // Deactivate on blockchain
    try {
      const { didRegistry } = getContracts();
      const tx = await didRegistry.deactivateDID(did);
      await tx.wait();
    } catch (blockchainError) {
      console.error('Blockchain deactivation failed:', blockchainError);
    }

    res.json({
      success: true,
      message: 'DID deactivated successfully'
    });

  } catch (error) {
    console.error('DID deactivation error:', error);
    res.status(500).json({ error: 'Failed to deactivate DID' });
  }
});

/**
 * @route   GET /api/did/controller/:address
 * @desc    Get DID by controller address
 * @access  Public
 */
router.get('/controller/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const didDoc = await DID.findOne({ 
      controller: address.toLowerCase(), 
      active: true 
    });

    if (!didDoc) {
      return res.status(404).json({ error: 'No DID found for this controller' });
    }

    res.json({
      success: true,
      did: didDoc.did,
      document: didDoc.document
    });

  } catch (error) {
    console.error('Controller lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup DID by controller' });
  }
});

module.exports = router;
