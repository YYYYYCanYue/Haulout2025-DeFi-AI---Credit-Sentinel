// Sui Provider Wrapper - 用于包装应用并提供 Sui 上下文
import { ReactNode } from 'react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SUI_NETWORK } from './suiConfig';

// 创建 QueryClient 实例
const queryClient = new QueryClient();

// 网络配置
const networks = {
  mainnet: { url: getFullnodeUrl('mainnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
};

interface SuiProviderProps {
  children: ReactNode;
}

export function SuiProvider({ children }: SuiProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={SUI_NETWORK}>
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}


