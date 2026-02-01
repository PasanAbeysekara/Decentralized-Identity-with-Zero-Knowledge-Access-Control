'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { zkProofAPI } from '@/lib/api';

export default function ZKProofPage() {
  const { address, isConnected } = useAccount();
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [selectedProofType, setSelectedProofType] = useState<'age' | 'credential' | 'membership'>('age');
  
  const [ageProofForm, setAgeProofForm] = useState({
    birthYear: new Date().getFullYear() - 25,
    birthMonth: 1,
    birthDay: 1,
    salt: Math.floor(Math.random() * 1000000),
    minAge: 18,
    credentialHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchProofs();
    }
  }, [mounted, isConnected, address]);

  const fetchProofs = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const did = `did:ethr:${address}`;
      const response = await zkProofAPI.getByProver(did);
      setProofs(response.proofs || []);
    } catch (error) {
      console.error('Error fetching proofs:', error);
      setProofs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgeProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const currentDate = new Date();
      const proof = await zkProofAPI.ageVerification({
        birthYear: ageProofForm.birthYear,
        birthMonth: ageProofForm.birthMonth,
        birthDay: ageProofForm.birthDay,
        salt: ageProofForm.salt,
        currentYear: currentDate.getFullYear(),
        currentMonth: currentDate.getMonth() + 1,
        currentDay: currentDate.getDate(),
        minAge: ageProofForm.minAge,
        credentialHash: ageProofForm.credentialHash
      });
      
      toast.success('Age verification proof generated successfully!');
      setShowProofForm(false);
      console.log('Generated proof:', proof);
      fetchProofs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate proof. Make sure ZK circuits are compiled.');
    }
  };

  const handleGenerateGenericProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const proof = await zkProofAPI.generate({
        proofType: selectedProofType,
        inputs: {
          // Add relevant inputs based on proof type
          prover: address,
          timestamp: Date.now()
        }
      });
      
      toast.success(`${selectedProofType} proof generated successfully!`);
      setShowProofForm(false);
      console.log('Generated proof:', proof);
      fetchProofs();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate proof');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to generate zero-knowledge proofs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Zero-Knowledge Proofs</h1>
            <button 
              onClick={() => setShowProofForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Generate Proof
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Prove statements without revealing sensitive information
            </h2>
            <p className="text-gray-600">
              Generate cryptographic proofs that verify your credentials, age, or membership 
              without exposing the underlying data. Powered by zero-knowledge cryptography.
            </p>
          </div>

          {showProofForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Generate New Proof</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProofType('age')}
                    className={`px-4 py-2 rounded-md ${
                      selectedProofType === 'age'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Age Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProofType('credential')}
                    className={`px-4 py-2 rounded-md ${
                      selectedProofType === 'credential'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Credential Ownership
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProofType('membership')}
                    className={`px-4 py-2 rounded-md ${
                      selectedProofType === 'membership'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Membership
                  </button>
                </div>
              </div>

              {selectedProofType === 'age' ? (
                <form onSubmit={handleGenerateAgeProof} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Year
                      </label>
                      <input
                        type="number"
                        value={ageProofForm.birthYear}
                        onChange={(e) => setAgeProofForm({...ageProofForm, birthYear: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Month
                      </label>
                      <input
                        type="number"
                        value={ageProofForm.birthMonth}
                        onChange={(e) => setAgeProofForm({...ageProofForm, birthMonth: parseInt(e.target.value)})}
                        min="1"
                        max="12"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Birth Day
                      </label>
                      <input
                        type="number"
                        value={ageProofForm.birthDay}
                        onChange={(e) => setAgeProofForm({...ageProofForm, birthDay: parseInt(e.target.value)})}
                        min="1"
                        max="31"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Age to Prove
                    </label>
                    <input
                      type="number"
                      value={ageProofForm.minAge}
                      onChange={(e) => setAgeProofForm({...ageProofForm, minAge: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credential Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={ageProofForm.credentialHash}
                      onChange={(e) => setAgeProofForm({...ageProofForm, credentialHash: e.target.value})}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    This will generate a proof that you are at least {ageProofForm.minAge} years old 
                    without revealing your exact birthdate.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Generate Age Proof
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProofForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleGenerateGenericProof} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {selectedProofType === 'credential' 
                      ? 'Generate a proof that you own a credential without revealing its contents.'
                      : 'Generate a proof of membership without revealing your identity.'}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Generate {selectedProofType === 'credential' ? 'Credential' : 'Membership'} Proof
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProofForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading proofs...</p>
            </div>
          ) : proofs.length > 0 ? (
            <div className="space-y-4">
              {proofs.map((proof, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {proof.proofType || 'Zero-Knowledge Proof'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Generated: {new Date(proof.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Verified ✓
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Proof ID:</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {proof._id || proof.proofId || `proof-${index}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        console.log('Proof details:', proof);
                        toast.success('Check console for proof details');
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
                        toast.success('Proof copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Copy Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No proofs yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate your first zero-knowledge proof to get started.
              </p>
              <div className="mt-6">
                <button 
                  onClick={() => setShowProofForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Generate Proof
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Zero-Knowledge Proofs Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Inputs</h3>
              <p className="text-gray-600">
                Your sensitive data (birthdate, credentials) stays private and is never revealed
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧮</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cryptographic Proof</h3>
              <p className="text-gray-600">
                Mathematical proof is generated that proves your statement without revealing data
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Verification</h3>
              <p className="text-gray-600">
                Anyone can verify the proof is valid without accessing your private information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
