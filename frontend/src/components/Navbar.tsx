'use client';

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { WalletIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      // Find injected connector (MetaMask)
      const injectedConnector = connectors.find(c => c.id === 'injected') || connectors[0];
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-600">
            DID-ZK
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/did" className="text-gray-700 hover:text-primary-600 transition">
              My DID
            </Link>
            <Link href="/credentials" className="text-gray-700 hover:text-primary-600 transition">
              Credentials
            </Link>
            <Link href="/zkproof" className="text-gray-700 hover:text-primary-600 transition">
              ZK Proofs
            </Link>
            <Link href="/access" className="text-gray-700 hover:text-primary-600 transition">
              Access Control
            </Link>
          </div>

          {/* Wallet Connection */}
          <div suppressHydrationWarning>
            {!mounted ? (
              <button
                className="btn-primary flex items-center gap-2 opacity-50"
                disabled
              >
                <WalletIcon className="w-5 h-5" />
                Connect Wallet
              </button>
            ) : isConnected && address ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{formatAddress(address)}</span>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="btn-primary flex items-center gap-2"
              >
                <WalletIcon className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
