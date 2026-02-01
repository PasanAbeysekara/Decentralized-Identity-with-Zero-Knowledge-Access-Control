'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateDIDPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingDID, setExistingDID] = useState<boolean | null>(null);
  const [checkingDID, setCheckingDID] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      checkExistingDID();
    }
  }, [mounted, isConnected, address]);

  const checkExistingDID = async () => {
    if (!address) return;
    
    setCheckingDID(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/did/did:ethr:${address}`);
      if (response.ok) {
        setExistingDID(true);
      } else {
        setExistingDID(false);
      }
    } catch (error) {
      console.error('Error checking DID:', error);
      setExistingDID(false);
    } finally {
      setCheckingDID(false);
    }
  };

  const createDID = async () => {
    if (!address) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError('API URL not configured. Please check your environment settings.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate a simple public key (in production, this should be derived from the wallet)
      const publicKey = '0x04e68acfc0253a10620dff706b0a1b1f1f5833ea3beb3bde2250d5f271f3563606672ebc45e0b7ea2e816ecb70ca03137b1c9476eec63d4632e990020b7b6fba39';

      console.log('Creating DID for address:', address);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/did/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          controller: address,
          publicKey: publicKey,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        console.log('Error response data:', data);
        let errorMessage = 'Failed to create DID';
        
        if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += `: ${data.details}`;
          }
          
          // If DID already exists, redirect to view page
          if (data.error.includes('already exists')) {
            toast.error('You already have a DID. Redirecting to view it...');
            setTimeout(() => {
              router.push('/did');
            }, 2000);
            return;
          }
        } else if (data.details) {
          errorMessage = data.details;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success response data:', data);

      if (!data.success && data.error) {
        // Handle case where API returns 200 but with error in body
        throw new Error(data.error);
      }

      setSuccess(true);
      toast.success('DID created successfully!');
      setTimeout(() => {
        router.push('/did');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating DID:', err);
      const errorMsg = err.message || 'Failed to create DID';
      setError(errorMsg);
      toast.error(errorMsg);
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
          <p className="text-gray-600">Please connect your wallet to create a DID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Your DID</h1>
          
          {checkingDID ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Checking for existing DID...</p>
            </div>
          ) : existingDID ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-yellow-800">DID Already Exists</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>A DID already exists for your wallet address:</p>
                    <div className="bg-white rounded-md p-3 mt-3 font-mono text-xs break-all" suppressHydrationWarning>
                      did:ethr:{address}
                    </div>
                    <p className="mt-4">Each wallet address can only have one DID. You can view your existing DID or use a different wallet to create a new one.</p>
                  </div>
                  <div className="mt-5 flex space-x-3">
                    <button
                      onClick={() => router.push('/did')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      View My DID
                    </button>
                    <button
                      onClick={() => setExistingDID(false)}
                      className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Show Form Anyway
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">DID Created Successfully!</h3>
                  <p className="mt-2 text-sm text-green-700">Redirecting to your DID page...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Controller Address
                </label>
                <div className="bg-gray-50 rounded-md p-3 font-mono text-sm break-all text-gray-900" suppressHydrationWarning>
                  {address}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DID to be Created
                </label>
                <div className="bg-blue-50 rounded-md p-3 font-mono text-sm break-all text-blue-900 border border-blue-200" suppressHydrationWarning>
                  did:ethr:{address}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">Failed to Create DID</h3>
                      <p className="mt-2 text-sm text-red-700">{error}</p>
                      <button
                        onClick={() => setError('')}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Your DID will be created on the blockchain</li>
                  <li>A DID document will be stored on IPFS</li>
                  <li>You'll be able to manage credentials and create ZK proofs</li>
                </ul>
              </div>

              <button
                onClick={createDID}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating DID...
                  </>
                ) : (
                  'Create DID'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
