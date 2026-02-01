const express = require('express');
const router = express.Router();
const { getContracts } = require('../config/blockchain');
const ZKProof = require('../models/ZKProof.model');

/**
 * @route   POST /api/access/request
 * @desc    Request access to a resource with ZK proof
 * @access  Public
 */
router.post('/request', async (req, res) => {
  try {
    const { resourceId, proof, publicSignals, requester } = req.body;

    // Validate inputs
    if (!resourceId || !proof || !publicSignals || !requester) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get ZK Access Control contract
    const { zkAccessControl } = getContracts();

    // Format proof for Solidity (groth16 format)
    const solidityProof = {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
      c: [proof.pi_c[0], proof.pi_c[1]],
      input: publicSignals
    };

    // Request access on-chain
    const tx = await zkAccessControl.requestAccess(
      resourceId,
      solidityProof.a,
      solidityProof.b,
      solidityProof.c,
      solidityProof.input
    );

    const receipt = await tx.wait();

    // Find AccessGranted event
    const accessGrantedEvent = receipt.logs.find(log => {
      try {
        const parsed = zkAccessControl.interface.parseLog(log);
        return parsed && parsed.name === 'AccessGranted';
      } catch {
        return false;
      }
    });

    let granted = false;
    let expiration = null;

    if (accessGrantedEvent) {
      const parsed = zkAccessControl.interface.parseLog(accessGrantedEvent);
      granted = true;
      expiration = new Date(Number(parsed.args.expiration) * 1000);
    }

    res.json({
      success: true,
      granted,
      resourceId,
      requester,
      expiration,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error('Access request error:', error);
    res.status(500).json({ 
      error: 'Failed to request access',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/access/check/:requester/:resourceId
 * @desc    Check if requester has access to resource
 * @access  Public
 */
router.get('/check/:requester/:resourceId', async (req, res) => {
  try {
    const { requester, resourceId } = req.params;

    const { zkAccessControl } = getContracts();
    const hasAccess = await zkAccessControl.hasAccess(requester, resourceId);

    res.json({
      success: true,
      hasAccess,
      requester,
      resourceId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

/**
 * @route   POST /api/access/policy
 * @desc    Create an access policy (admin only)
 * @access  Private (admin)
 */
router.post('/policy', async (req, res) => {
  try {
    const { 
      policyId, 
      resourceId, 
      requiredCredentialType, 
      minAge, 
      requireMembership, 
      verifierContract 
    } = req.body;

    // Strip did:ethr: prefix from verifier contract address if present
    let verifierAddress = verifierContract;
    if (verifierContract && verifierContract.startsWith('did:ethr:')) {
      verifierAddress = verifierContract.replace('did:ethr:', '');
    }

    const { zkAccessControl } = getContracts();

    const tx = await zkAccessControl.createPolicy(
      policyId,
      resourceId,
      requiredCredentialType || '',
      minAge || 0,
      requireMembership || false,
      verifierAddress
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Access policy created successfully',
      policyId,
      resourceId,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error('Policy creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create policy',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/access/policy/:policyId
 * @desc    Get access policy details
 * @access  Public
 */
router.get('/policy/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;

    const { zkAccessControl } = getContracts();
    const policy = await zkAccessControl.policies(policyId);

    res.json({
      success: true,
      policy: {
        policyId: policy.policyId,
        resourceId: policy.resourceId,
        requiredCredentialType: policy.requiredCredentialType,
        minAge: Number(policy.minAge),
        requireMembership: policy.requireMembership,
        verifierContract: policy.verifierContract,
        active: policy.active
      }
    });

  } catch (error) {
    console.error('Policy retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve policy' });
  }
});

/**
 * @route   DELETE /api/access/revoke
 * @desc    Revoke access for a requester (admin only)
 * @access  Private (admin)
 */
router.delete('/revoke', async (req, res) => {
  try {
    const { requester, resourceId } = req.body;

    const { zkAccessControl } = getContracts();
    const tx = await zkAccessControl.revokeAccess(requester, resourceId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Access revoked successfully',
      requester,
      resourceId,
      transactionHash: receipt.hash
    });

  } catch (error) {
    console.error('Access revocation error:', error);
    res.status(500).json({ 
      error: 'Failed to revoke access',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/access/history/:requester
 * @desc    Get access history for a requester
 * @access  Public
 */
router.get('/history/:requester', async (req, res) => {
  try {
    let { requester } = req.params;

    // If requester is a DID, extract the address
    if (requester.startsWith('did:ethr:')) {
      requester = requester.replace('did:ethr:', '');
    }

    const { zkAccessControl } = getContracts();
    
    let history = [];
    try {
      history = await zkAccessControl.getAccessHistory(requester);
    } catch (error) {
      // If the call fails (e.g., empty data), return empty history
      console.log('No access history found for requester:', requester);
    }

    res.json({
      success: true,
      count: history.length,
      history: history.map(record => ({
        resourceId: record.resourceId,
        timestamp: new Date(Number(record.timestamp) * 1000),
        granted: record.granted
      }))
    });

  } catch (error) {
    console.error('Access history retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve access history' });
  }
});

module.exports = router;
