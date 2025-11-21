import { createContext, useContext } from 'react';

export interface AuthContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
  wallet?: any; // Sui 钱包实例
}

// 默认值
const defaultContext: AuthContextType = {
  isConnected: false,
  address: null,
  connectWallet: async () => { console.warn('AuthProvider not initialized') },
  disconnectWallet: () => { console.warn('AuthProvider not initialized') },
  isLoading: false,
  error: null,
  wallet: null
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);