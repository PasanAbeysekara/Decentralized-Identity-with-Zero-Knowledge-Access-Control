const express = require('express');
const router = express.Router();
const snarkjs = require('snarkjs');
const fs = require('fs').promises;
const path = require('path');
const ZKProof = require('../models/ZKProof.model');
const crypto = require('crypto');

// Paths to circuit artifacts
const CIRCUITS_PATH = path.join(__dirname, '../../circuits/build');

/**
 * @route   POST /api/zkproof/generate
 * @desc    Generate a zero-knowledge proof
 * @access  Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { proofType, inputs } = req.body;

    if (!['ageVerification', 'credentialOwnership', 'membershipVerification'].includes(proofType)) {
      return res.status(400).json({ error: 'Invalid proof type' });
    }

    // Get circuit files
    const wasmFile = path.join(CIRCUITS_PATH, `${proofType}_js/${proofType}.wasm`);
    const zkeyFile = path.join(CIRCUITS_PATH, `${proofType}_0001.zkey`);

    // Check if files exist
    try {
      await fs.access(wasmFile);
      await fs.access(zkeyFile);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Circuit files not found. Please compile circuits first.',
        hint: 'Run: npm run circuits:compile && npm run circuits:setup'
      });
    }

    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      wasmFile,
      zkeyFile
    );

    // Generate proof ID
    const proofId = crypto.randomUUID();

    // Save proof to database
    const zkProof = new ZKProof({
      proofId,
      proofType,
      prover: inputs.prover || 'anonymous',
      proof: {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c,
        protocol: proof.protocol || 'groth16',
        curve: proof.curve || 'bn128'
      },
      publicSignals,
      resourceId: inputs.resourceId,
      metadata: inputs.metadata
    });

    await zkProof.save();

    res.json({
      success: true,
      proofId,
      proof,
      publicSignals,
      message: 'Zero-knowledge proof generated successfully'
    });

  } catch (error) {
    console.error('Proof generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate proof',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/zkproof/verify
 * @desc    Verify a zero-knowledge proof
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { proofType, proof, publicSignals } = req.body;

    if (!['ageVerification', 'credentialOwnership', 'membershipVerification'].includes(proofType)) {
      return res.status(400).json({ error: 'Invalid proof type' });
    }

    // Get verification key
    const vKeyFile = path.join(CIRCUITS_PATH, `${proofType}_verification_key.json`);

    try {
      await fs.access(vKeyFile);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Verification key not found',
        hint: 'Run: npm run circuits:setup'
      });
    }

    const vKey = JSON.parse(await fs.readFile(vKeyFile, 'utf8'));

    // Verify proof
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    res.json({
      success: true,
      verified,
      proofType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Proof verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify proof',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/zkproof/:proofId
 * @desc    Get proof by ID
 * @access  Public
 */
router.get('/:proofId', async (req, res) => {
  try {
    const { proofId } = req.params;

    const zkProof = await ZKProof.findOne({ proofId });

    if (!zkProof) {
      return res.status(404).json({ error: 'Proof not found' });
    }

    res.json({
      success: true,
      proof: {
        id: zkProof.proofId,
        type: zkProof.proofType,
        prover: zkProof.prover,
        proof: zkProof.proof,
        publicSignals: zkProof.publicSignals,
        verified: zkProof.verificationResult,
        created: zkProof.created,
        expiresAt: zkProof.expiresAt
      }
    });

  } catch (error) {
    console.error('Proof retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve proof' });
  }
});

/**
 * @route   GET /api/zkproof/prover/:prover
 * @desc    Get all proofs by prover
 * @access  Public
 */
router.get('/prover/:prover', async (req, res) => {
  try {
    const { prover } = req.params;
    const { proofType } = req.query;

    const query = { prover };
    if (proofType) {
      query.proofType = proofType;
    }

    const proofs = await ZKProof.find(query)
      .sort({ created: -1 })
      .limit(100);

    res.json({
      success: true,
      count: proofs.length,
      proofs: proofs.map(p => ({
        id: p.proofId,
        type: p.proofType,
        verified: p.verificationResult,
        created: p.created,
        resourceId: p.resourceId
      }))
    });

  } catch (error) {
    console.error('Prover proofs retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve proofs' });
  }
});

/**
 * @route   POST /api/zkproof/age-verification
 * @desc    Helper endpoint for age verification proof
 * @access  Public
 */
router.post('/age-verification', async (req, res) => {
  try {
    const { birthYear, birthMonth, birthDay, salt, currentYear, currentMonth, currentDay, minAge, prover, credentialId } = req.body;

    // Validate inputs
    if (!birthYear || !birthMonth || !birthDay || !salt || !currentYear || !currentMonth || !currentDay || !minAge || !prover) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const inputs = {
      birthYear,
      birthMonth,
      birthDay,
      salt,
      currentYear,
      currentMonth,
      currentDay,
      minAge
    };

    const wasmFile = path.join(CIRCUITS_PATH, 'ageVerification_js/ageVerification.wasm');
    const zkeyFile = path.join(CIRCUITS_PATH, 'ageVerification_0001.zkey');

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmFile, zkeyFile);

    // Auto-verify
    const vKeyFile = path.join(CIRCUITS_PATH, 'ageVerification_verification_key.json');
    const vKey = JSON.parse(await fs.readFile(vKeyFile, 'utf8'));
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    // Save proof to database
    const proofId = crypto.randomUUID();
    const zkProof = new ZKProof({
      proofId,
      proofType: 'ageVerification',
      prover,
      proof: {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c,
        protocol: proof.protocol || 'groth16',
        curve: proof.curve || 'bn128'
      },
      publicSignals,
      verificationResult: verified,
      resourceId: credentialId,
      metadata: {
        minAge,
        verifiedAt: new Date().toISOString()
      }
    });

    await zkProof.save();

    res.json({
      success: true,
      verified,
      proofId,
      proof,
      publicSignals,
      message: verified ? 'Age verification successful' : 'Age verification failed'
    });

  } catch (error) {
    console.error('Age verification error:', error);
    res.status(500).json({ 
      error: 'Failed to perform age verification',
      details: error.message 
    });
  }
});

module.exports = router;
