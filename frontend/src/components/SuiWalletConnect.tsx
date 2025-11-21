/**
 * Sui 钱包连接组件示例
 * 展示如何使用新的 Sui 集成
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';
import { getUserCreditBadge, getAccountBalance, formatSuiAddress } from '@/lib/web3';
import { getConfigurationStatus } from '@/lib/contractObjects';

export default function SuiWalletConnect() {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading, error, wallet } = useAuth();
  const [nftInfo, setNftInfo] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');
  const [configStatus, setConfigStatus] = useState<any>(null);

  // 检查配置状态
  useEffect(() => {
    const status = getConfigurationStatus();
    setConfigStatus(status);
  }, []);

  // 查询 NFT 和余额
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    } else {
      setNftInfo(null);
      setBalance('0');
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    if (!address) return;

    try {
      // 查询 NFT
      const nft = await getUserCreditBadge(address);
      setNftInfo(nft);

      // 查询余额
      const balanceInfo = await getAccountBalance(address);
      setBalance(balanceInfo?.formattedBalance || '0');
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* 配置状态提示 */}
      {configStatus && !configStatus.configured && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-yellow-400 font-semibold mb-1">配置提醒</h3>
              <p className="text-sm text-yellow-200">{configStatus.message}</p>
              <p className="text-xs text-yellow-300 mt-2">
                请查看 SETUP_INSTRUCTIONS.md 了解如何配置
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 钱包连接卡片 */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Sui 钱包</h2>
        
        {!isConnected ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔐</div>
            <p className="text-gray-400 mb-6">请连接您的 Sui 钱包以继续</p>
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? '连接中...' : '连接 Sui 钱包'}
            </button>
            {error && (
              <p className="text-red-400 text-sm mt-4">{error}</p>
            )}
            <div className="mt-6 text-xs text-gray-500">
              <p>需要安装 Sui Wallet 或其他兼容钱包</p>
              <a 
                href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                安装 Sui Wallet
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 地址和余额 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">钱包地址</span>
                <button
                  onClick={() => navigator.clipboard.writeText(address || '')}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                  title="复制地址"
                >
                  📋 复制
                </button>
              </div>
              <p className="font-mono text-sm break-all">{address}</p>
              {address && (
                <p className="text-gray-500 text-xs mt-1">
                  {formatSuiAddress(address)}
                </p>
              )}
            </div>

            {/* 余额 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <span className="text-gray-400 text-sm block mb-1">余额</span>
              <p className="text-2xl font-bold">{balance} SUI</p>
              {parseFloat(balance) < 0.1 && (
                <a
                  href="https://faucet.sui.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline mt-2 inline-block"
                >
                  获取测试币 →
                </a>
              )}
            </div>

            {/* NFT 状态 */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <span className="text-gray-400 text-sm block mb-2">信用凭证 NFT</span>
              {nftInfo === null ? (
                <p className="text-gray-500 text-sm">加载中...</p>
              ) : nftInfo.hasNFT ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-green-300">已拥有信用凭证</span>
                  </div>
                  <div className="text-sm space-y-1 pl-6">
                    <p className="text-gray-400">Token ID: {nftInfo.tokenId}</p>
                    <p className="text-gray-400">层级: {nftInfo.tierId}</p>
                    <p className="text-gray-400">评分: {nftInfo.lastScore}</p>
                    {nftInfo.explorerUrl && (
                      <a
                        href={nftInfo.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                      >
                        在浏览器中查看 →
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-2">○</span>
                  <span className="text-gray-400">暂无信用凭证</span>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={loadUserData}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔄 刷新
              </button>
              <button
                onClick={disconnectWallet}
                className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium py-2 px-4 rounded-lg transition-colors border border-red-800"
              >
                断开连接
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 开发者信息 */}
      {isConnected && wallet && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3">开发者信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">钱包名称:</span>
              <span>{wallet.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">钱包版本:</span>
              <span>{wallet.version || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">支持功能:</span>
              <span className="text-xs">
                {Object.keys(wallet.features || {}).length} 个
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




