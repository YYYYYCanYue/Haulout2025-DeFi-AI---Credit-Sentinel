import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallets, useConnectWallet, useCurrentAccount } from '@mysten/dapp-kit';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletSelector({ isOpen, onClose }: WalletSelectorProps) {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (walletName: string) => {
    const wallet = wallets.find(w => w.name === walletName);
    if (!wallet) return;

    setConnecting(walletName);
    
    connect(
      { wallet },
      {
        onSuccess: () => {
          console.log('✅ 已连接到:', walletName);
          setConnecting(null);
          onClose();
        },
        onError: (err) => {
          console.error('❌ 连接失败:', err);
          setConnecting(null);
          alert(`连接 ${walletName} 失败: ${err.message}`);
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">选择钱包</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="关闭"
              title="关闭"
              type="button"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          {/* 钱包列表 */}
          {wallets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-exclamation-triangle text-yellow-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">未检测到钱包</h3>
              <p className="text-gray-400 text-sm mb-6">
                请先安装 Sui 钱包扩展
              </p>
              <a
                href="https://chrome.google.com/webstore/search/sui%20wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-download"></i>
                <span>安装钱包</span>
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet) => {
                const isConnected = currentAccount?.wallet?.name === wallet.name;
                const isConnecting = connecting === wallet.name;

                return (
                  <motion.button
                    key={wallet.name}
                    onClick={() => !isConnected && handleConnect(wallet.name)}
                    disabled={isConnecting || isConnected}
                    whileHover={!isConnected ? { scale: 1.02 } : {}}
                    whileTap={!isConnected ? { scale: 0.98 } : {}}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isConnected
                        ? 'bg-blue-600/20 border-blue-500/50 cursor-default'
                        : 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:bg-gray-750'
                    } ${isConnecting ? 'opacity-50 cursor-wait' : ''}`}
                    type="button"
                  >
                    <div className="flex items-center space-x-3">
                      {/* 钱包图标 */}
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                        {wallet.icon ? (
                          <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                        ) : (
                          <i className="fa-solid fa-wallet text-blue-400"></i>
                        )}
                      </div>
                      
                      {/* 钱包信息 */}
                      <div className="text-left">
                        <div className="font-semibold text-white">{wallet.name}</div>
                        {isConnected && currentAccount?.address && (
                          <div className="text-xs text-gray-400 font-mono">
                            {currentAccount.address.substring(0, 10)}...
                            {currentAccount.address.substring(currentAccount.address.length - 8)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 状态指示器 */}
                    <div>
                      {isConnecting ? (
                        <i className="fa-solid fa-spinner fa-spin text-blue-400"></i>
                      ) : isConnected ? (
                        <div className="flex items-center space-x-2 text-green-400">
                          <span className="text-sm">已连接</span>
                          <i className="fa-solid fa-check-circle"></i>
                        </div>
                      ) : (
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* 提示信息 */}
          {wallets.length > 0 && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="flex items-start space-x-2 text-sm text-blue-300">
                <i className="fa-solid fa-info-circle mt-0.5"></i>
                <div>
                  <p className="mb-1">💡 <strong>提示</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-200/80">
                    <li>点击钱包即可连接</li>
                    <li>在钱包扩展中切换账户会自动更新</li>
                    <li>切换账户后信用评分会自动刷新</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

