'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function MyDIDPage() {
  const { address, isConnected } = useAccount();
  const [did, setDid] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchDID();
    }
  }, [isConnected, address]);

  const fetchDID = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/did/resolve/did:ethr:${address}`);
      if (response.ok) {
        const data = await response.json();
        setDid(data);
      }
    } catch (error) {
      console.error('Error fetching DID:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your DID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My DID</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Ethereum Address
            </label>
            <div className="bg-gray-50 rounded-md p-3 font-mono text-sm break-all">
              {address}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your DID
            </label>
            <div className="bg-gray-50 rounded-md p-3 font-mono text-sm break-all">
              did:ethr:{address}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading DID document...</p>
            </div>
          ) : did ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">DID Document</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(did.document, null, 2)}
                </pre>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  did.onChain ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {did.onChain ? '✓ On-chain' : '⚠ Off-chain'}
                </span>
                {did.active && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Active
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No DID found for this address</p>
              <a
                href="/did/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create DID
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
