'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { accessAPI } from '@/lib/api';

export default function AccessControlPage() {
  const { address, isConnected } = useAccount();
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    policyId: '',
    resourceId: '',
    resourceName: '',
    requiredCredentialType: 'AgeCredential',
    minAge: 18,
    requireMembership: false,
    verifierContract: '0x0000000000000000000000000000000000000000'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchAccessRequests();
    }
  }, [mounted, isConnected, address]);

  const fetchAccessRequests = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Backend expects DID format: /api/access/history/:requester
      const did = `did:ethr:${address}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/access/history/${did}`);
      if (response.ok) {
        const data = await response.json();
        setAccessRequests(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const policyId = policyForm.policyId || `policy-${Date.now()}`;
      const resourceId = policyForm.resourceId || `resource-${Date.now()}`;
      
      await accessAPI.createPolicy({
        policyId,
        resourceId,
        requiredCredentialType: policyForm.requiredCredentialType,
        minAge: policyForm.minAge,
        requireMembership: policyForm.requireMembership,
        verifierContract: policyForm.verifierContract
      });
      
      toast.success('Access policy created successfully!');
      setShowPolicyForm(false);
      setPolicyForm({
        policyId: '',
        resourceId: '',
        resourceName: '',
        requiredCredentialType: 'AgeCredential',
        minAge: 18,
        requireMembership: false,
        verifierContract: '0x0000000000000000000000000000000000000000'
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create policy');
    }
  };

  const handleApproveAccess = async (request: any) => {
    try {
      // In a real implementation, this would call the smart contract
      toast.success('Access approved! (Feature requires smart contract integration)');
      fetchAccessRequests();
    } catch (error: any) {
      toast.error('Failed to approve access');
    }
  };

  const handleDenyAccess = async (request: any) => {
    try {
      toast.error('Access denied');
      fetchAccessRequests();
    } catch (error: any) {
      toast.error('Failed to deny access');
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
          <p className="text-gray-600">Please connect your wallet to manage access control</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Access Control</h1>
            <button 
              onClick={() => setShowPolicyForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Access Policy
            </button>
          </div>

          {showPolicyForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Create New Access Policy</h3>
              <form onSubmit={handleCreatePolicy} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy ID
                    </label>
                    <input
                      type="text"
                      value={policyForm.policyId}
                      onChange={(e) => setPolicyForm({...policyForm, policyId: e.target.value})}
                      placeholder="Leave empty for auto-generation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource ID
                    </label>
                    <input
                      type="text"
                      value={policyForm.resourceId}
                      onChange={(e) => setPolicyForm({...policyForm, resourceId: e.target.value})}
                      placeholder="Leave empty for auto-generation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    value={policyForm.resourceName}
                    onChange={(e) => setPolicyForm({...policyForm, resourceName: e.target.value})}
                    placeholder="e.g., Premium Content, VIP Section"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Credential Type
                    </label>
                    <select
                      value={policyForm.requiredCredentialType}
                      onChange={(e) => setPolicyForm({...policyForm, requiredCredentialType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    >
                      <option value="AgeCredential">Age Credential</option>
                      <option value="EducationCredential">Education Credential</option>
                      <option value="MembershipCredential">Membership Credential</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      value={policyForm.minAge}
                      onChange={(e) => setPolicyForm({...policyForm, minAge: parseInt(e.target.value)})}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verifier Contract Address
                  </label>
                  <input
                    type="text"
                    value={policyForm.verifierContract}
                    onChange={(e) => setPolicyForm({...policyForm, verifierContract: e.target.value})}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireMembership"
                    checked={policyForm.requireMembership}
                    onChange={(e) => setPolicyForm({...policyForm, requireMembership: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireMembership" className="ml-2 block text-sm text-gray-900">
                    Require membership verification
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPolicyForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Grant access to resources based on verified zero-knowledge proofs
            </h2>
            <p className="text-gray-600">
              Control who can access your resources without revealing sensitive information. 
              Use ZK proofs to verify credentials and attributes privately.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading access requests...</p>
            </div>
          ) : accessRequests.length > 0 ? (
            <div className="space-y-4">
              {accessRequests.map((request, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {request.resourceName || 'Access Request'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested by: {request.requester?.substring(0, 10)}...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Status: <span className={`font-medium ${request.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {request.status || 'Pending'}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleApproveAccess(request)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDenyAccess(request)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No access requests</h3>
              <p className="mt-1 text-sm text-gray-500">Access requests will appear here when users request access to your resources.</p>
              <div className="mt-6">
                <button 
                  onClick={() => setShowPolicyForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Access Rule
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Set Requirements</h3>
              <p className="text-sm text-gray-600">Define what attributes or credentials are required to access your resource</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Verify Proofs</h3>
              <p className="text-sm text-gray-600">Users submit ZK proofs that verify their credentials without revealing data</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Grant Access</h3>
              <p className="text-sm text-gray-600">Automatically grant access when proofs are verified on-chain</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
