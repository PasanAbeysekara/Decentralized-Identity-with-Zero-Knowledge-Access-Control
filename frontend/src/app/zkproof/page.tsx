'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function ZKProofPage() {
  const { address, isConnected } = useAccount();
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchProofs();
    }
  }, [isConnected, address]);

  const fetchProofs = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zkproof/${address}`);
      if (response.ok) {
        const data = await response.json();
        setProofs(data.proofs || []);
      }
    } catch (error) {
      console.error('Error fetching proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view and create zero-knowledge proofs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zero-Knowledge Proofs</h1>
              <p className="text-gray-600 mt-2">
                Prove attributes like age or credentials without revealing actual data
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Proof
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Age Verification</h3>
              <p className="text-sm text-blue-700">Prove you're over a certain age without revealing your birthdate</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Credential Ownership</h3>
              <p className="text-sm text-green-700">Prove you own a valid credential without exposing details</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Membership Verification</h3>
              <p className="text-sm text-purple-700">Prove membership in a group without revealing your identity</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading proofs...</p>
            </div>
          ) : proofs.length > 0 ? (
            <div className="space-y-4">
              {proofs.map((proof, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {proof.type || 'ZK Proof'}
                        </h3>
                        {proof.verified && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Proof Hash: {proof.proofHash?.substring(0, 20)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(proof.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No proofs created yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first zero-knowledge proof to get started.</p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Create Your First Proof
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Zero-Knowledge Proofs Work</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Zero-knowledge proofs allow you to prove the truth of a statement without revealing any information beyond the validity of the statement itself.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Private</h3>
                <p className="text-sm">Your actual data never leaves your device and is never revealed to anyone</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">✅ Verifiable</h3>
                <p className="text-sm">Proofs can be verified on-chain by anyone without trusting a central authority</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">⚡ Efficient</h3>
                <p className="text-sm">Verification is fast and cost-effective using zkSNARKs</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔐 Secure</h3>
                <p className="text-sm">Cryptographically secure proofs that cannot be forged or tampered with</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
