'use client';

import Link from 'next/link';
import { useWalletStore } from '@/store/walletStore';
import { WalletIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWalletStore();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    }
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
          <div>
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{formatAddress(address)}</span>
                <button
                  onClick={disconnectWallet}
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
