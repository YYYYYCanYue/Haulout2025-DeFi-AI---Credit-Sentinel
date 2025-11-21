import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import WalletSelector from './WalletSelector';

export default function Navigation() {
  const { isConnected, address, disconnectWallet, isLoading } = useAuth();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  // 格式化地址显示
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {/* 钱包选择器模态框 */}
      <WalletSelector 
        isOpen={showWalletSelector} 
        onClose={() => setShowWalletSelector(false)} 
      />
      
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-shield text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              DeFi-AI信用哨兵
            </span>
          </div>
          
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">首页</Link>
              <Link to="/lending-simulator" className="text-gray-300 hover:text-white transition-colors">借贷器</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">关于</Link>
              <Link to="/documentation" className="text-gray-300 hover:text-white transition-colors">文档</Link>
              <Link to="/api" className="text-gray-300 hover:text-white transition-colors">API</Link>
            </nav>
          
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <motion.button
                onClick={() => setShowWalletSelector(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-full transition-all duration-300 shadow-lg shadow-blue-600/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>连接中...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wallet mr-2"></i>连接钱包
                  </>
                )}
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2">
                {/* 钱包地址显示 */}
                <div className="bg-gray-800 rounded-full py-2 px-4 flex items-center space-x-3 border border-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-gray-300 font-mono">
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={() => {
                      if (address) {
                        navigator.clipboard.writeText(address);
                        alert('地址已复制！');
                      }
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="复制地址"
                    title="复制完整地址"
                    type="button"
                  >
                    <i className="fa-solid fa-copy text-xs"></i>
                  </button>
                </div>
                
                {/* 切换钱包按钮 */}
                <motion.button 
                  onClick={() => setShowWalletSelector(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-600/40 rounded-full py-2 px-4 transition-all duration-200 flex items-center space-x-2"
                  aria-label="切换钱包"
                  title="切换钱包或账户"
                  type="button"
                >
                  <i className="fa-solid fa-repeat text-sm"></i>
                  <span className="text-sm font-medium hidden lg:inline">切换</span>
                </motion.button>
                
                {/* 断开连接按钮 */}
                <motion.button 
                  onClick={disconnectWallet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/40 rounded-full py-2 px-4 transition-all duration-200 flex items-center space-x-2"
                  aria-label="断开钱包连接"
                  title="断开钱包连接"
                  type="button"
                >
                  <i className="fa-solid fa-power-off text-sm"></i>
                  <span className="text-sm font-medium hidden sm:inline">断开</span>
                </motion.button>
              </div>
            )}
            
            <button 
              className="md:hidden text-gray-300 hover:text-white"
              aria-label="打开菜单"
              title="打开菜单"
              type="button"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}