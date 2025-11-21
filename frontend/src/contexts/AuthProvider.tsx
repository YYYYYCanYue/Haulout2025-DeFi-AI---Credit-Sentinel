import { ReactNode, useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './authContext';
import { useWallets, useConnectWallet, useDisconnectWallet, useCurrentAccount } from '@mysten/dapp-kit';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 从 dapp-kit 获取连接状态
  const isConnected = !!currentAccount;
  const address = currentAccount?.address || null;
  const wallet = wallets.find(w => w.name === currentAccount?.wallet?.name) || null;

  // 监听地址变化，输出日志
  useEffect(() => {
    if (address) {
      console.log('✅ 钱包地址已更新:', address);
    }
  }, [address]);

  // 连接钱包
  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (wallets.length === 0) {
        setError('请先安装 Sui 钱包扩展');
        console.error('未检测到 Sui 钱包');
        setIsLoading(false);
        return;
      }

      // 连接第一个可用钱包
      const firstWallet = wallets[0];
      console.log('尝试连接钱包:', firstWallet.name);
      
      connect(
        { wallet: firstWallet },
        {
          onSuccess: () => {
            console.log('✅ 钱包连接成功');
          },
          onError: (err) => {
            console.error('❌ 连接钱包失败:', err);
            setError(err.message || '连接钱包失败');
          }
        }
      );
    } catch (err: any) {
      console.error('❌ 连接钱包失败:', err);
      setError(err.message || '连接钱包失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    try {
      console.log('🔌 正在断开钱包连接...');
      disconnect();
      console.log('✅ 钱包已断开');
    } catch (err: any) {
      console.error('❌ 断开钱包失败:', err);
      setError(err.message || '断开钱包失败');
    }
  };

  const contextValue: AuthContextType = {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
    wallet, // 提供钱包实例用于签名交易
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
