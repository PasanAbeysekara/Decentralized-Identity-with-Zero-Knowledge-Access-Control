'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function MyDIDPage() {
  const { address, isConnected } = useAccount();
  const [did, setDid] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchDID();
    }
  }, [mounted, isConnected, address]);

  const fetchDID = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/did/did:ethr:${address}`;
      console.log('Fetching DID from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status, 'OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Backend returns { success, didDocument, metadata }
        // Transform to match expected structure
        if (data.success && data.didDocument) {
          const transformedDid = {
            document: data.didDocument,
            onChain: data.metadata?.onChain || false,
            active: true, // If we got it, it's active
            created: data.metadata?.created,
            updated: data.metadata?.updated,
            documentHash: data.metadata?.documentHash
          };
          console.log('Setting DID:', transformedDid);
          setDid(transformedDid);
        } else {
          console.log('Data structure not as expected:', data);
          setDid(null);
        }
      } else {
        console.log('Response not OK, setting DID to null');
        setDid(null);
      }
    } catch (error) {
      console.error('Error fetching DID:', error);
      setDid(null);
    } finally {
      setLoading(false);
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
            <div className="bg-gray-50 rounded-md p-3 font-mono text-sm break-all text-gray-900" suppressHydrationWarning>
              {address}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your DID
            </label>
            <div className="bg-blue-50 rounded-md p-3 font-mono text-sm break-all text-blue-900 border border-blue-200" suppressHydrationWarning>
              did:ethr:{address}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DID Status
            </label>
            <div className="flex items-center space-x-2">
              {loading ? (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                  Checking...
                </span>
              ) : did ? (
                <>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    DID Exists
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    did.onChain ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {did.onChain ? '✓ On-chain' : '⚠ Off-chain only'}
                  </span>
                  {did.active && (
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Active
                    </span>
                  )}
                </>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  No DID Found
                </span>
              )}
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
                <pre className="text-xs overflow-auto text-gray-900">
                  {JSON.stringify(did.document, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No DID Document Found</h3>
              <p className="text-gray-600 mb-6">You haven't created a DID for this wallet address yet. Create one to start managing your decentralized identity and credentials.</p>
              <a
                href="/did/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your DID
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
