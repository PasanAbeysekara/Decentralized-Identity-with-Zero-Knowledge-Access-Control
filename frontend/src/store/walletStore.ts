import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,

  connectWallet: async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      set({
        address: accounts[0],
        provider,
        signer,
        chainId,
        isConnected: true,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnectWallet();
        } else {
          set({ address: accounts[0] });
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  },

  disconnectWallet: () => {
    set({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
    });
  },

  switchChain: async (targetChainId: number) => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain doesn't exist, add it
      if (error.code === 4902) {
        console.error('Chain not added to MetaMask');
      }
      throw error;
    }
  },
}));

// Extend Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}
