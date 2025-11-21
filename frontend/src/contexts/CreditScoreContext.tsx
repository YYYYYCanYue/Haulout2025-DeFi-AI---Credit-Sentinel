import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './authContext';

interface CreditScoreContextType {
  creditScore: number;
  isLoading: boolean;
  error: string | null;
  refreshCreditScore: () => Promise<void>;
}

const CreditScoreContext = createContext<CreditScoreContextType | undefined>(undefined);

export const useCreditScore = () => {
  const context = useContext(CreditScoreContext);
  if (!context) {
    throw new Error('useCreditScore must be used within CreditScoreProvider');
  }
  return context;
};

interface CreditScoreProviderProps {
  children: ReactNode;
}

export const CreditScoreProvider = ({ children }: CreditScoreProviderProps) => {
  const { isConnected, address } = useAuth();
  const [creditScore, setCreditScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const refreshCreditScore = async () => {
    if (!address) {
      setCreditScore(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          data: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.creditScore) {
        setCreditScore(data.creditScore);
      } else {
        throw new Error('无法获取信用评分');
      }
    } catch (err: any) {
      console.error('获取信用评分失败:', err);
      setError(err.message || '获取信用评分失败');
      // 设置默认评分
      setCreditScore(600);
    } finally {
      setIsLoading(false);
    }
  };

  // 当钱包连接时自动获取信用评分
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔄 钱包地址已变化，重新获取信用评分:', address);
      refreshCreditScore();
    } else {
      console.log('🔌 钱包未连接，重置信用评分');
      setCreditScore(0);
    }
  }, [isConnected, address]);

  const value: CreditScoreContextType = {
    creditScore,
    isLoading,
    error,
    refreshCreditScore,
  };

  return (
    <CreditScoreContext.Provider value={value}>
      {children}
    </CreditScoreContext.Provider>
  );
};


