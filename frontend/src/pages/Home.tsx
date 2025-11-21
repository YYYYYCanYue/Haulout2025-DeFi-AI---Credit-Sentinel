import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, Cell } from 'recharts';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CreditScoreCard from '@/components/CreditScoreCard';
import NFTCertificate from '@/components/NFTCertificate';
import { useAuth } from '@/contexts/authContext';
import ProtocolIntegration from '@/components/ProtocolIntegration';
import LendingDemo from '@/components/LendingDemo';
import Footer from '@/components/Footer';
import { mintCreditBadge, getUserCreditBadge } from '@/lib/web3';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

// 信用评分历史数据示例
const scoreHistoryData = [
  { month: 'Jan', score: 620 },
  { month: 'Feb', score: 635 },
  { month: 'Mar', score: 650 },
  { month: 'Apr', score: 645 },
  { month: 'May', score: 660 },
  { month: 'Jun', score: 680 },
  { month: 'Jul', score: 710 },
];

// 信用评估因子数据示例
const creditFactorsData = [
  { subject: '资产负债率', A: 80, fullMark: 100 },
  { subject: '流动性比率', A: 75, fullMark: 100 },
  { subject: '收入稳定性', A: 85, fullMark: 100 },
  { subject: '交易频率', A: 65, fullMark: 100 },
  { subject: '资产多样性', A: 70, fullMark: 100 },
  { subject: '协议交互广度', A: 90, fullMark: 100 },
  { subject: '最大回撤率', A: 60, fullMark: 100 },
  { subject: '市场敏感度', A: 75, fullMark: 100 },
  { subject: '违约历史', A: 95, fullMark: 100 },
];

// 抵押率数据
const collateralRateData = [
  { name: '传统DeFi', rate: 150 },
  { name: '信用哨兵 (700+)', rate: 80 },
  { name: '信用哨兵 (600-700)', rate: 100 },
  { name: '信用哨兵 (500-600)', rate: 120 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Home() {
  const { isConnected, address } = useAuth();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [creditScore, setCreditScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [claimData, setClaimData] = useState<any>(null);
  const [nftMinted, setNftMinted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>(null);
  const [mintError, setMintError] = useState('');
  
  // 添加API调用函数
  const fetchCreditScore = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    setError('');
    try {
      // 调用后端 API 获取信用评分和申领数据
      const response = await fetch('http://localhost:3001/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setCreditScore(data.creditScore);
        setClaimData(data);
      } else {
        setError(data.error || '获取信用分数失败');
        console.error('获取信用分数失败:', data.error);
      }
    } catch (error) {
      setError('API请求失败');
      console.error('API请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 临界刷新签名（剩余<=60秒则重新获取签名）
  const refreshClaimIfNeeded = async () => {
    if (!address || !claimData) return null;
    const deadline = Number(claimData.deadline ?? 0);
    const secondsLeft = deadline - Math.floor(Date.now() / 1000);
    if (Number.isFinite(secondsLeft) && secondsLeft <= 60) {
      try {
        // 重新调用 claim API 获取新签名
        const resp = await fetch('http://localhost:3001/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        });
        if (resp.ok) {
          const fresh = await resp.json();
          if (fresh.success) {
            setCreditScore(fresh.creditScore);
            setClaimData(fresh);
            return fresh;
          }
        }
      } catch (e) {
        console.error('刷新签名失败:', e);
      }
    }
    return claimData;
  };

  // 铸造NFT 信用凭证
  const mintNFT = async () => {
    if (!address || !claimData) return;
    
    if (!signAndExecuteTransaction) {
      setMintError('钱包未正确连接，请重新连接');
      return;
    }
    
    setIsMinting(true);
    setMintError('');
    try {
      // 在铸造前，如果签名临近过期则刷新
      const payload = await refreshClaimIfNeeded();
      
      console.log('开始铸造 NFT...');
      
      // 调用合约铸造NFT，传入 signAndExecuteTransaction
      const result = await mintCreditBadge(
        payload || claimData,
        signAndExecuteTransaction
      );
      
      if (result.success) {
        setNftMinted(true);
        console.log('NFT铸造成功，交易哈希:', result.hash);
        
        // 获取NFT信息
        setTimeout(async () => {
          const badgeInfo = await getUserCreditBadge(address);
          setNftInfo(badgeInfo);
        }, 2000); // 等待交易确认
      } else {
        setMintError(result.error || '铸造NFT失败');
        console.error('铸造NFT失败:', result.error);
      }
    } catch (error: any) {
      setMintError(error.message || '铸造NFT过程中发生错误');
      console.error('铸造NFT错误:', error);
    } finally {
      setIsMinting(false);
    }
  };
  
  // 检查用户是否已经拥有NFT
  const checkUserNFT = async (address: string) => {
    if (!address) return;
    
    try {
      const badgeInfo = await getUserCreditBadge(address);
      if (badgeInfo.hasNFT) {
        setNftInfo(badgeInfo);
        setNftMinted(true);
        console.log('✅ 该地址已拥有 NFT:', badgeInfo);
      } else {
        // 新地址没有NFT，重置状态
        setNftInfo(null);
        setNftMinted(false);
        console.log('ℹ️ 该地址暂无 NFT，可以铸造');
      }
    } catch (error) {
      console.error('检查NFT状态失败:', error);
      // 出错时也重置状态，允许尝试铸造
      setNftInfo(null);
      setNftMinted(false);
    }
  };
  
  // 当钱包地址变化时重置状态并重新获取数据
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔄 检测到地址变化，重置状态并获取新数据:', address);
      
      // 立即重置所有状态
      setCreditScore(0);
      setClaimData(null);
      setNftMinted(false);
      setNftInfo(null);
      setMintError('');
      setError('');
      
      // 获取新地址的数据
      fetchCreditScore(address);
      checkUserNFT(address);
    } else if (!isConnected) {
      // 断开连接时清理所有状态
      console.log('🔌 钱包已断开，清理所有状态');
      setCreditScore(0);
      setClaimData(null);
      setNftMinted(false);
      setNftInfo(null);
      setMintError('');
      setError('');
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation />
      
      {!isConnected ? (
        <HeroSection />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* 加载状态 */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">正在分析您的链上数据...</p>
              </div>
            </div>
          )}
          
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
              <p className="flex items-center">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </p>
            </div>
          )}
          
          {/* 标签导航 */}
          {!isLoading && !error && (
            <>
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-800 rounded-lg p-1">
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('dashboard')}
              >
                信用仪表盘
              </button>
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'nft' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('nft')}
              >
                NFT信用凭证
              </button>
              <button
                    type="button"
                className={`px-6 py-2 rounded-md ${activeTab === 'protocols' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setActiveTab('protocols')}
              >
                协议集成
              </button>
            </div>
          </div>
          
          {/* 仪表盘内容 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CreditScoreCard score={creditScore || 710} />
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <i className="fa-solid fa-chart-line mr-2 text-blue-400"></i>
                    信用评分趋势
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[500, 800]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            borderColor: '#374151',
                            borderRadius: '12px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#1E40AF' }}
                          activeDot={{ r: 8, fill: '#60A5FA', strokeWidth: 2, stroke: '#3B82F6' }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="fa-solid fa-radar mr-2 text-blue-400"></i>
                  信用评估维度
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={creditFactorsData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
                      <Radar
                        name="信用评分"
                        dataKey="A"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                        animationDuration={1500}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <i className="fa-solid fa-percent mr-2 text-blue-400"></i>
                  抵押率对比
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collateralRateData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          borderColor: '#374151',
                          borderRadius: '12px'
                        }} 
                        formatter={(value) => [`${value}%`, '抵押率']}
                      />
                      <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                        {collateralRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <LendingDemo />
            </div>
          )}
          
              {/* NFT信用凭证 */}
          {activeTab === 'nft' && (
                <div className="flex flex-col items-center py-8">
                  <NFTCertificate score={creditScore || 710} />
                  
                  <div className="mt-16">
                    {nftMinted ? (
                      <div className="bg-green-500/20 border border-green-500 text-green-100 px-6 py-4 rounded-lg">
                        <div className="flex items-center mb-3">
                          <i className="fa-solid fa-circle-check text-2xl mr-4"></i>
                          <div>
                            <h4 className="font-semibold text-lg">已拥有信用凭证！</h4>
                            <p className="text-sm opacity-80">
                              当前 Tier {nftInfo?.tier || '?'} | 评分 {nftInfo?.score || creditScore}
                            </p>
                            {nftInfo && nftInfo.tokenId && (
                              <p className="text-xs mt-1 opacity-60">Token ID: {nftInfo.tokenId}</p>
                            )}
                          </div>
                        </div>
                        {/* 显示升级提示 */}
                        {nftInfo && claimData && claimData.tierId > nftInfo.tier && (
                          <div className="mt-3 pt-3 border-t border-green-400/30">
                            <p className="text-sm flex items-center">
                              <i className="fa-solid fa-arrow-up mr-2"></i>
                              您的信用评分已提升！可以升级到 Tier {claimData.tierId}
                            </p>
                            <motion.button
                              type="button"
                              onClick={mintNFT}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={isMinting}
                              className={`mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg text-sm transition-all duration-300 ${isMinting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {isMinting ? (
                                <>
                                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>升级中...
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-level-up-alt mr-2"></i>
                                  升级到 Tier {claimData.tierId}
                                </>
                              )}
                            </motion.button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {mintError && (
                          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
                            <p className="flex items-center">
                              <i className="fa-solid fa-circle-exclamation mr-2"></i>
                              {mintError}
                            </p>
                          </div>
                        )}
                        <motion.button
                          type="button"
                          onClick={mintNFT}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isMinting || !claimData}
                          className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 text-lg transition-all duration-300 ${(isMinting || !claimData) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isMinting ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin mr-2"></i>铸造中...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-certificate mr-2"></i>铸造NFT信用凭证
                            </>
                          )}
                        </motion.button>
                        {claimData && (
                          <p className="mt-4 text-sm text-gray-400">
                            将铸造 Tier {claimData.tierId} 的信用凭证
                          </p>
                        )}
                      </>
                    )}
                  </div>
            </div>
          )}
          
              {/* 协议集成 */}
          {activeTab === 'protocols' && (
            <div className="space-y-8">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30 mb-8"
                >
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">体验完整借贷流程</h3>
                  <p className="text-gray-300 mb-6">通过我们的借贷器，体验基于信用评分的个性化DeFi借贷服务</p>
                  <Link 
                    to="/lending-simulator"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <i className="fa-solid fa-rocket mr-2"></i>
                    开始借贷
                  </Link>
                </motion.div>
              </div>
              <ProtocolIntegration />
            </div>
          )}
            </>
          )}
        </div>
      )}
      
      <Footer />
    </div>
  );
}