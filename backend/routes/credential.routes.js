const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Credential = require('../models/Credential.model');
const DID = require('../models/DID.model');
const { getContracts } = require('../config/blockchain');
const { uploadToIPFS } = require('../config/ipfs');
const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * @route   POST /api/credentials/issue
 * @desc    Issue a new verifiable credential
 * @access  Private (issuer only)
 */
router.post('/issue', async (req, res) => {
  try {
    const { issuerDID, subjectDID, credentialType, claims, expirationDate } = req.body;

    // Verify issuer DID exists and is active
    const issuer = await DID.findOne({ did: issuerDID, active: true });
    if (!issuer) {
      return res.status(404).json({ error: 'Issuer DID not found or inactive' });
    }

    // Verify subject DID exists and is active
    const subject = await DID.findOne({ did: subjectDID, active: true });
    if (!subject) {
      return res.status(404).json({ error: 'Subject DID not found or inactive' });
    }

    // Generate credential ID
    const credentialId = `urn:uuid:${crypto.randomUUID()}`;

    // Create credential object
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: credentialId,
      type: ['VerifiableCredential', credentialType],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null,
      credentialSubject: {
        id: subjectDID,
        ...claims
      }
    };

    // Generate credential hash
    const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(credential)));

    // Create proof (simplified - in production use proper signing)
    const proof = {
      type: 'EcdsaSecp256k1Signature2019',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDID}#key-1`,
      jws: 'mock_signature_' + credentialHash.substring(0, 20) // Mock signature
    };

    credential.proof = proof;

    // Upload to IPFS
    const metadataURI = await uploadToIPFS(credential);

    // Save to database
    const newCredential = new Credential({
      credentialId,
      credentialHash,
      type: credential.type,
      issuer: {
        did: issuerDID,
        address: issuer.controller
      },
      credentialSubject: {
        id: subjectDID,
        claims
      },
      issuanceDate: credential.issuanceDate,
      expirationDate: credential.expirationDate,
      proof,
      metadataURI,
      status: 'active'
    });

    await newCredential.save();

    // Register on blockchain
    try {
      const { credentialRegistry } = getContracts();
      const expirationTimestamp = expirationDate ? Math.floor(new Date(expirationDate).getTime() / 1000) : 0;
      
      const tx = await credentialRegistry.issueCredential(
        ethers.id(credentialId),
        credentialHash,
        credentialType,
        subjectDID,
        expirationTimestamp,
        metadataURI
      );
      
      const receipt = await tx.wait();
      newCredential.onChain = true;
      newCredential.transactionHash = receipt.hash;
      await newCredential.save();
    } catch (blockchainError) {
      console.error('Blockchain issuance failed:', blockchainError);
    }

    res.status(201).json({
      success: true,
      credential,
      credentialId,
      metadataURI,
      onChain: newCredential.onChain,
      transactionHash: newCredential.transactionHash
    });

  } catch (error) {
    console.error('Credential issuance error:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

/**
 * @route   GET /api/credentials/:credentialId
 * @desc    Get credential by ID
 * @access  Public
 */
router.get('/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findOne({ credentialId });

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({
      success: true,
      credential: {
        id: credential.credentialId,
        type: credential.type,
        issuer: credential.issuer,
        subject: credential.credentialSubject,
        issuanceDate: credential.issuanceDate,
        expirationDate: credential.expirationDate,
        status: credential.status,
        metadataURI: credential.metadataURI,
        isValid: credential.isValid()
      }
    });

  } catch (error) {
    console.error('Credential retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve credential' });
  }
});

/**
 * @route   GET /api/credentials/subject/:did
 * @desc    Get all credentials for a subject DID
 * @access  Public
 */
router.get('/subject/:did', async (req, res) => {
  try {
    const { did } = req.params;
    const { status } = req.query;

    const query = { 'credentialSubject.id': did };
    if (status) {
      query.status = status;
    }

    const credentials = await Credential.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: credentials.length,
      credentials: credentials.map(cred => ({
        id: cred.credentialId,
        type: cred.type,
        issuer: cred.issuer.did,
        issuanceDate: cred.issuanceDate,
        expirationDate: cred.expirationDate,
        status: cred.status,
        isValid: cred.isValid()
      }))
    });

  } catch (error) {
    console.error('Credentials retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve credentials' });
  }
});

/**
 * @route   GET /api/credentials/issuer/:did
 * @desc    Get all credentials issued by a DID
 * @access  Public
 */
router.get('/issuer/:did', async (req, res) => {
  try {
    const { did } = req.params;

    const credentials = await Credential.find({ 'issuer.did': did }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: credentials.length,
      credentials: credentials.map(cred => ({
        id: cred.credentialId,
        type: cred.type,
        subject: cred.credentialSubject.id,
        issuanceDate: cred.issuanceDate,
        expirationDate: cred.expirationDate,
        status: cred.status
      }))
    });

  } catch (error) {
    console.error('Issued credentials retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve issued credentials' });
  }
});

/**
 * @route   POST /api/credentials/:credentialId/revoke
 * @desc    Revoke a credential
 * @access  Private (issuer only)
 */
router.post('/:credentialId/revoke', async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { issuerAddress, reason } = req.body;

    const credential = await Credential.findOne({ credentialId });

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Verify issuer
    if (credential.issuer.address.toLowerCase() !== issuerAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: Not the credential issuer' });
    }

    if (credential.status === 'revoked') {
      return res.status(400).json({ error: 'Credential already revoked' });
    }

    credential.status = 'revoked';
    credential.revocationDate = new Date();
    credential.revocationReason = reason || 'No reason provided';
    await credential.save();

    // Revoke on blockchain
    try {
      const { credentialRegistry } = getContracts();
      const tx = await credentialRegistry.revokeCredential(ethers.id(credentialId));
      await tx.wait();
    } catch (blockchainError) {
      console.error('Blockchain revocation failed:', blockchainError);
    }

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      credentialId,
      revocationDate: credential.revocationDate
    });

  } catch (error) {
    console.error('Credential revocation error:', error);
    res.status(500).json({ error: 'Failed to revoke credential' });
  }
});

/**
 * @route   POST /api/credentials/verify
 * @desc    Verify a credential
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { credentialId } = req.body;

    const credential = await Credential.findOne({ credentialId });

    if (!credential) {
      return res.status(404).json({ 
        success: false, 
        error: 'Credential not found',
        verified: false 
      });
    }

    const isValid = credential.isValid();

    // Check on-chain status if available
    let onChainValid = null;
    if (credential.onChain) {
      try {
        const { credentialRegistry } = getContracts();
        onChainValid = await credentialRegistry.verifyCredential(ethers.id(credentialId));
      } catch (error) {
        console.error('On-chain verification error:', error);
      }
    }

    res.json({
      success: true,
      verified: isValid && (onChainValid === null || onChainValid),
      credentialId,
      status: credential.status,
      checks: {
        notRevoked: credential.status !== 'revoked',
        notExpired: !credential.expirationDate || credential.expirationDate > new Date(),
        onChain: onChainValid
      },
      issuanceDate: credential.issuanceDate,
      expirationDate: credential.expirationDate
    });

  } catch (error) {
    console.error('Credential verification error:', error);
    res.status(500).json({ error: 'Failed to verify credential' });
  }
});

module.exports = router;
