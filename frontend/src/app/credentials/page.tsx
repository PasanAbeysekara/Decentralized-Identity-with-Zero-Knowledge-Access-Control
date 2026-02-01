'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { credentialsAPI, zkProofAPI } from '@/lib/api';

export default function CredentialsPage() {
  const { address, isConnected } = useAccount();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    issuerDID: '',
    credentialType: 'AgeCredential',
    claims: '{}'
  });
  const [proofForm, setProofForm] = useState({
    birthYear: new Date().getFullYear() - 25,
    birthMonth: 1,
    birthDay: 1,
    salt: Math.floor(Math.random() * 1000000)
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchCredentials();
    }
  }, [mounted, isConnected, address]);

  const fetchCredentials = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Backend expects DID format: /api/credentials/subject/:did
      const did = `did:ethr:${address}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credentials/subject/${did}`);
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const subjectDID = `did:ethr:${address}`;
      const claims = JSON.parse(requestForm.claims);
      
      await credentialsAPI.issue({
        issuerDID: requestForm.issuerDID,
        subjectDID,
        credentialType: requestForm.credentialType,
        claims
      });
      
      toast.success('Credential request submitted successfully!');
      setShowRequestForm(false);
      setRequestForm({ issuerDID: '', credentialType: 'AgeCredential', claims: '{}' });
      fetchCredentials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to request credential');
    }
  };

  const handleGenerateProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !selectedCredential) return;

    try {
      const currentDate = new Date();
      const proof = await zkProofAPI.ageVerification({
        birthYear: proofForm.birthYear,
        birthMonth: proofForm.birthMonth,
        birthDay: proofForm.birthDay,
        salt: proofForm.salt,
        currentYear: currentDate.getFullYear(),
        currentMonth: currentDate.getMonth() + 1,
        currentDay: currentDate.getDate(),
        minAge: 18,
        credentialHash: selectedCredential.credentialHash || '0x0'
      });
      
      toast.success('ZK Proof generated successfully!');
      setShowProofForm(false);
      console.log('Generated proof:', proof);
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
          <p className="text-gray-600">Please connect your wallet to view your credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Credentials</h1>
            <button 
              onClick={() => setShowRequestForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Request Credential
            </button>
          </div>

          {showRequestForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Request New Credential</h3>
              <form onSubmit={handleRequestCredential} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer DID
                  </label>
                  <input
                    type="text"
                    value={requestForm.issuerDID}
                    onChange={(e) => setRequestForm({...requestForm, issuerDID: e.target.value})}
                    placeholder="did:ethr:0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential Type
                  </label>
                  <select
                    value={requestForm.credentialType}
                    onChange={(e) => setRequestForm({...requestForm, credentialType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="AgeCredential">Age Credential</option>
                    <option value="EducationCredential">Education Credential</option>
                    <option value="MembershipCredential">Membership Credential</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claims (JSON)
                  </label>
                  <textarea
                    value={requestForm.claims}
                    onChange={(e) => setRequestForm({...requestForm, claims: e.target.value})}
                    placeholder='{"age": 25, "verified": true}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showProofForm && selectedCredential && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Generate Zero-Knowledge Proof</h3>
              <form onSubmit={handleGenerateProof} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Year
                    </label>
                    <input
                      type="number"
                      value={proofForm.birthYear}
                      onChange={(e) => setProofForm({...proofForm, birthYear: parseInt(e.target.value)})}
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
                      value={proofForm.birthMonth}
                      onChange={(e) => setProofForm({...proofForm, birthMonth: parseInt(e.target.value)})}
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
                      value={proofForm.birthDay}
                      onChange={(e) => setProofForm({...proofForm, birthDay: parseInt(e.target.value)})}
                      min="1"
                      max="31"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  This will generate a proof that you are over 18 without revealing your exact birthdate.
                </p>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowProofForm(false); setSelectedCredential(null); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading credentials...</p>
            </div>
          ) : credentials.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((credential, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {credential.type || 'Credential'}
                    </span>
                    {credential.verified && (
                      <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {credential.credentialSubject?.name || 'Unnamed Credential'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Issued by: {credential.issuer?.substring(0, 10)}...
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        console.log('Credential details:', credential);
                        toast.success('Check console for details');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCredential(credential);
                        setShowProofForm(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Create Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by requesting your first credential.</p>
              <div className="mt-6">
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Request Credential
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
