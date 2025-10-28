import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  wallet: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

// Check if Phantom wallet is installed
const getPhantom = () => {
  if (typeof window !== 'undefined' && 'solana' in window) {
    const provider = (window as any).solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  return null;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const phantom = getPhantom();
      if (phantom && phantom.isConnected) {
        try {
          const response = await phantom.connect({ onlyIfTrusted: true });
          setWallet(phantom);
          setPublicKey(response.publicKey.toString());
          setIsConnected(true);
          console.log('Phantom Already Connected:', response.publicKey.toString());
        } catch (err) {
          console.log('Auto-connect rejected');
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for wallet disconnect events
  useEffect(() => {
    if (!wallet) return;

    const handleDisconnect = () => {
      setWallet(null);
      setPublicKey(null);
      setIsConnected(false);
      console.log('Phantom Disconnected');
    };

    wallet.on('disconnect', handleDisconnect);

    return () => {
      wallet.off('disconnect', handleDisconnect);
    };
  }, [wallet]);

  // Listen for account changes
  useEffect(() => {
    if (!wallet) return;

    const handleAccountChange = (publicKey: any) => {
      if (publicKey) {
        setPublicKey(publicKey.toString());
        console.log('Account Changed:', publicKey.toString());
      } else {
        setPublicKey(null);
        setIsConnected(false);
      }
    };

    wallet.on('accountChanged', handleAccountChange);

    return () => {
      wallet.off('accountChanged', handleAccountChange);
    };
  }, [wallet]);

  const connectWallet = useCallback(async () => {
    console.log('🔥 Connect button clicked!');
    
    try {
      // Check if Phantom is installed
      console.log('Checking for Phantom...');
      console.log('window.solana:', typeof window !== 'undefined' ? (window as any).solana : 'window not available');
      
      const phantom = getPhantom();
      console.log('Phantom provider:', phantom);

      if (!phantom) {
        console.log('❌ Phantom not found, redirecting to install page');
        alert('Phantom wallet not found! Opening Phantom website...');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      console.log('✅ Phantom found, requesting connection...');
      
      // Connect to Phantom
      const response = await phantom.connect();
      console.log('✅ Phantom connection response:', response);
      
      setWallet(phantom);
      setPublicKey(response.publicKey.toString());
      setIsConnected(true);
      console.log('🎉 Phantom Connected Successfully! Public Key:', response.publicKey.toString());
      
      // Show success message
      alert(`Connected to Phantom!\n\nPublic Key: ${response.publicKey.toString().substring(0, 10)}...`);
    } catch (err: any) {
      console.error('❌ Connection error:', err);
      
      if (err.code === 4001) {
        console.log('User rejected connection');
        alert('Connection rejected. Please approve the connection in Phantom to use the app.');
      } else {
        console.error('Connection error details:', err);
        alert(`Failed to connect wallet:\n\n${err.message || 'Unknown error'}\n\nMake sure Phantom extension is installed and unlocked.`);
      }
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      if (wallet && wallet.disconnect) {
        await wallet.disconnect();
      }
      setWallet(null);
      setPublicKey(null);
      setIsConnected(false);
      console.log('Phantom Disconnected');
    } catch (err) {
      console.error('Disconnect error:', err);
      // Clear state anyway
      setWallet(null);
      setPublicKey(null);
      setIsConnected(false);
    }
  }, [wallet]);

  const value = {
    publicKey,
    isConnected,
    connectWallet,
    disconnectWallet,
    wallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default WalletProvider;
