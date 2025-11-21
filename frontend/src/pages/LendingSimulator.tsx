import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCreditScore } from '@/contexts/CreditScoreContext';
import { useAuth } from '@/contexts/authContext';

// 资产价格数据（基于 2024 年市场价格）
const assetPrices = {
  ETH: 3500,      // 以太坊
  USDC: 1,        // 稳定币
  USDT: 1,        // 稳定币
  DAI: 1,         // 稳定币
  WBTC: 68000,    // 比特币
  LINK: 14,       // Chainlink
  UNI: 7.5,       // Uniswap
  COMP: 50,       // Compound
  AAVE: 95,       // Aave
  MATIC: 0.8      // Polygon
};

// DeFi 协议真实参数（基于 2024 年主流协议）
const protocols = [
  {
    id: 'aave',
    name: 'Aave V3',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Aave%20logo%2C%20DeFi%20protocol%2C%20blue%20color&sign=3b2620f4f63cb47e8dae44db44e47a7f',
    description: '去中心化借贷协议',
    baseRate: 3.8,              // 稳定币基础年化利率
    maxLTV: 0.75,               // 最大贷款价值比 75%（需要 133% 抵押率）
    liquidationThreshold: 0.80, // 清算阈值 80%（健康因子 < 1 时清算）
    liquidationPenalty: 0.05,   // 清算罚金 5%
    collateralRatio: 1.33,      // 超额抵押率（133%）
    supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH', 'WBTC', 'AAVE'],
    utilizationRate: 0.72
  },
  {
    id: 'compound',
    name: 'Compound V3',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Compound%20logo%2C%20DeFi%20protocol%2C%20purple%20color&sign=cc9adebb402a1918c244866b97e9d4fb',
    description: '算法货币市场协议',
    baseRate: 4.2,              // 稳定币基础年化利率
    maxLTV: 0.70,               // 最大贷款价值比 70%（需要 143% 抵押率）
    liquidationThreshold: 0.75, // 清算阈值 75%
    liquidationPenalty: 0.08,   // 清算罚金 8%
    collateralRatio: 1.43,      // 超额抵押率（143%）
    supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH', 'WBTC', 'COMP'],
    utilizationRate: 0.68
  },
  {
    id: 'makerdao',
    name: 'MakerDAO',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=MakerDAO%20logo%2C%20DeFi%20protocol%2C%20green%20color&sign=1f909126fdeb75b10d580a3665031121',
    description: 'DAI 稳定币铸造协议',
    baseRate: 2.5,              // 稳定费率（Stability Fee）
    maxLTV: 0.65,               // 最大贷款价值比 65%（需要 154% 抵押率）
    liquidationThreshold: 0.67, // 清算阈值 67%（Maker 使用 150% 最低抵押率）
    liquidationPenalty: 0.13,   // 清算罚金 13%
    collateralRatio: 1.54,      // 超额抵押率（154%）
    supportedAssets: ['ETH', 'WBTC', 'LINK', 'UNI', 'MATIC'],
    utilizationRate: 0.85
  }
];

// 用户资产示例数据
const userAssets = [
  { symbol: 'ETH', amount: 5.2, value: 5.2 * assetPrices.ETH },
  { symbol: 'USDC', amount: 15000, value: 15000 * assetPrices.USDC },
  { symbol: 'WBTC', amount: 0.8, value: 0.8 * assetPrices.WBTC },
  { symbol: 'AAVE', amount: 50, value: 50 * assetPrices.AAVE },
  { symbol: 'LINK', amount: 200, value: 200 * assetPrices.LINK }
];

// 借贷利率历史数据（稳定币年化利率趋势）
const rateHistoryData = [
  { date: '2024-01', aave: 4.2, compound: 4.8, makerdao: 3.0 },
  { date: '2024-02', aave: 4.0, compound: 4.5, makerdao: 2.8 },
  { date: '2024-03', aave: 3.8, compound: 4.3, makerdao: 2.5 },
  { date: '2024-04', aave: 3.9, compound: 4.4, makerdao: 2.6 },
  { date: '2024-05', aave: 3.7, compound: 4.1, makerdao: 2.4 },
  { date: '2024-06', aave: 3.8, compound: 4.2, makerdao: 2.5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function LendingSimulator() {
  const { isConnected } = useAuth();
  const { creditScore, isLoading: scoreLoading } = useCreditScore();
  const [selectedProtocol, setSelectedProtocol] = useState(protocols[0]);
  const [collateralAsset, setCollateralAsset] = useState('ETH');
  const [borrowAsset, setBorrowAsset] = useState('USDC');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('simulator');
  const [autoCalculate, setAutoCalculate] = useState(true);
  
  // 使用真实信用评分，未连接时使用默认值
  const effectiveCreditScore = isConnected ? creditScore : 600;

  // 自动计算建议借贷金额（当抵押金额改变时）
  useEffect(() => {
    if (autoCalculate && collateralAmount && parseFloat(collateralAmount) > 0) {
      const collateralValue = parseFloat(collateralAmount) * assetPrices[collateralAsset as keyof typeof assetPrices];
      // 根据协议的最大 LTV 计算建议借贷金额（使用 80% 的最大额度以保持安全）
      const suggestedBorrowValue = collateralValue * selectedProtocol.maxLTV * 0.8;
      const suggestedBorrowAmount = suggestedBorrowValue / assetPrices[borrowAsset as keyof typeof assetPrices];
      setBorrowAmount(suggestedBorrowAmount.toFixed(2));
    }
  }, [collateralAmount, collateralAsset, borrowAsset, selectedProtocol, autoCalculate]);

  // 自动执行借贷分析（当借贷金额改变时）
  useEffect(() => {
    if (collateralAmount && borrowAmount && parseFloat(collateralAmount) > 0 && parseFloat(borrowAmount) > 0) {
      const timer = setTimeout(() => {
        runSimulation();
      }, 500); // 延迟 500ms 避免频繁计算
      return () => clearTimeout(timer);
    }
  }, [collateralAmount, borrowAmount, collateralAsset, borrowAsset, effectiveCreditScore, selectedProtocol]);

  // 计算个性化利率
  const getPersonalizedRate = (baseRate: number, creditScore: number) => {
    if (creditScore >= 700) return baseRate * 0.8;
    if (creditScore >= 600) return baseRate * 0.9;
    if (creditScore >= 500) return baseRate * 0.95;
    return baseRate;
  };

  // 计算健康因子
  const calculateHealthFactor = (collateralValue: number, borrowValue: number, ltv: number) => {
    if (borrowValue === 0) return Infinity;
    return (collateralValue * ltv) / borrowValue;
  };

  // 执行借贷分析
  const runSimulation = () => {
    if (!collateralAmount || !borrowAmount) return;

    const collateralValue = parseFloat(collateralAmount) * assetPrices[collateralAsset as keyof typeof assetPrices];
    const borrowValue = parseFloat(borrowAmount) * assetPrices[borrowAsset as keyof typeof assetPrices];
    const personalizedRate = getPersonalizedRate(selectedProtocol.baseRate, effectiveCreditScore);
    const healthFactor = calculateHealthFactor(collateralValue, borrowValue, selectedProtocol.maxLTV);
    const maxBorrowAmount = collateralValue * selectedProtocol.maxLTV;
    const utilizationRate = borrowValue / maxBorrowAmount;

    setSimulationResult({
      collateralValue,
      borrowValue,
      personalizedRate,
      healthFactor,
      maxBorrowAmount,
      utilizationRate,
      monthlyInterest: borrowValue * (personalizedRate / 100) / 12,
      annualInterest: borrowValue * (personalizedRate / 100),
      rateDiscount: ((selectedProtocol.baseRate - personalizedRate) / selectedProtocol.baseRate) * 100
    });
  };

  // 资产分布数据
  const assetDistributionData = userAssets.map(asset => ({
    name: asset.symbol,
    value: asset.value
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">DeFi 智能借贷平台</h1>
          <p className="text-gray-400 max-w-3xl mx-auto mb-3">
            基于 AI 信用评分的智能借贷平台，享受个性化利率优惠和超额抵押折扣
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <i className="fa-solid fa-shield-halved text-blue-400 mr-2"></i>
              <span>超额抵押保障</span>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-chart-line text-green-400 mr-2"></i>
              <span>实时利率</span>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-coins text-yellow-400 mr-2"></i>
              <span>多资产支持</span>
            </div>
          </div>
        </motion.div>

        {/* 标签页导航 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1">
            {[
              { id: 'simulator', label: '借贷', icon: 'fa-calculator' },
              { id: 'portfolio', label: '资产组合', icon: 'fa-chart-pie' },
              { id: 'rates', label: '利率趋势', icon: 'fa-chart-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'simulator' && (
          <>
            {/* 超额抵押机制说明 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30 mb-6"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <i className="fa-solid fa-info-circle text-blue-400 text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">什么是超额抵押？</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    超额抵押是 DeFi 借贷的核心机制，要求抵押物价值超过借贷金额。例如，抵押率 <span className="text-orange-400 font-semibold">150%</span> 意味着您需要抵押价值 <span className="text-green-400 font-semibold">$150</span> 的资产才能借出 <span className="text-blue-400 font-semibold">$100</span>。
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <div className="text-gray-400 mb-1">抵押率</div>
                      <div className="text-orange-400 font-semibold">抵押物价值 / 借贷金额</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <div className="text-gray-400 mb-1">LTV（贷款价值比）</div>
                      <div className="text-green-400 font-semibold">借贷金额 / 抵押物价值</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2">
                      <div className="text-gray-400 mb-1">健康因子</div>
                      <div className="text-blue-400 font-semibold">&lt; 1 时会被清算</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧：协议选择和借贷表单 */}
              <div className="lg:col-span-2 space-y-6">
              {/* 协议选择 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4">选择借贷协议</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {protocols.map((protocol) => (
                    <button
                      key={protocol.id}
                      onClick={() => setSelectedProtocol(protocol)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedProtocol.id === protocol.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <img src={protocol.logo} alt={protocol.name} className="w-8 h-8 rounded mr-3" />
                        <div>
                          <h4 className="font-semibold">{protocol.name}</h4>
                          <p className="text-sm text-gray-400">{protocol.description}</p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">基础利率:</span>
                          <span className="text-blue-400 font-medium">{protocol.baseRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">抵押率:</span>
                          <span className="text-orange-400 font-medium">{(protocol.collateralRatio * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">最大LTV:</span>
                          <span className="text-green-400 font-medium">{(protocol.maxLTV * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">清算罚金:</span>
                          <span className="text-red-400 font-medium">{(protocol.liquidationPenalty * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* 借贷表单 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">借贷参数设置</h3>
                  <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCalculate}
                      onChange={(e) => setAutoCalculate(e.target.checked)}
                      className="mr-2"
                    />
                    自动计算建议金额
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 抵押资产 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      抵押资产
                    </label>
                    <select
                      value={collateralAsset}
                      onChange={(e) => setCollateralAsset(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      aria-label="选择抵押资产"
                    >
                      {selectedProtocol.supportedAssets.map((asset) => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                  </div>

                  {/* 抵押数量 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      抵押数量
                    </label>
                    <input
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="输入抵押数量"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 借贷资产 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      借贷资产
                    </label>
                    <select
                      value={borrowAsset}
                      onChange={(e) => setBorrowAsset(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      aria-label="选择借贷资产"
                    >
                      {selectedProtocol.supportedAssets.map((asset) => (
                        <option key={asset} value={asset}>{asset}</option>
                      ))}
                    </select>
                  </div>

                  {/* 借贷数量 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      借贷数量
                      {autoCalculate && collateralAmount && (
                        <span className="ml-2 text-xs text-green-400">
                          <i className="fa-solid fa-sparkles mr-1"></i>
                          已自动计算
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => {
                        setBorrowAmount(e.target.value);
                        if (e.target.value) setAutoCalculate(false); // 手动修改时关闭自动计算
                      }}
                      placeholder={autoCalculate ? "将自动计算建议金额" : "输入借贷数量"}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    {collateralAmount && borrowAmount && (
                      <p className="mt-1 text-xs text-gray-400">
                        最大可借: {(parseFloat(collateralAmount) * assetPrices[collateralAsset as keyof typeof assetPrices] * selectedProtocol.maxLTV / assetPrices[borrowAsset as keyof typeof assetPrices]).toFixed(2)} {borrowAsset}
                      </p>
                    )}
                  </div>
                </div>

                {/* 自动分析提示 */}
                {simulationResult && (
                  <div className="mt-4 flex items-center text-sm text-green-400 bg-green-900/20 rounded-lg px-4 py-2 border border-green-700/30">
                    <i className="fa-solid fa-circle-check mr-2"></i>
                    <span>借贷方案已自动分析</span>
                  </div>
                )}
                
                {!collateralAmount && (
                  <div className="mt-4 flex items-center text-sm text-blue-400 bg-blue-900/20 rounded-lg px-4 py-2 border border-blue-700/30">
                    <i className="fa-solid fa-info-circle mr-2"></i>
                    <span>请输入抵押数量，系统将自动计算建议借贷金额</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* 右侧：结果展示 */}
            <div className="space-y-6">
              {/* 信用评分卡片 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  信用评分
                  {!isConnected && (
                    <span className="ml-2 text-xs text-gray-400">(演示)</span>
                  )}
                </h3>
                {scoreLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-400">正在获取信用评分...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{effectiveCreditScore}</div>
                    <div className="text-sm text-gray-400 mb-4">
                      {isConnected ? '当前评分' : '演示评分'}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(effectiveCreditScore / 800) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {effectiveCreditScore >= 700 ? '✅ 优秀' : effectiveCreditScore >= 600 ? '👍 良好' : effectiveCreditScore >= 500 ? '📊 一般' : '⚠️ 需要改善'}
                    </div>
                    {!isConnected && (
                      <div className="mt-3 text-xs text-yellow-400 bg-yellow-900/20 rounded-lg p-2 border border-yellow-700/30">
                        <i className="fa-solid fa-info-circle mr-1"></i>
                        连接钱包查看真实评分
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* 借贷结果 */}
              {simulationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-green-400 mb-4">
                    <i className="fa-solid fa-chart-bar mr-2"></i>
                    借贷分析结果
                  </h3>
                  
                  {/* 抵押与借贷 */}
                  <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">抵押价值:</span>
                        <span className="text-white font-semibold">${simulationResult.collateralValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">借贷价值:</span>
                        <span className="text-white font-semibold">${simulationResult.borrowValue.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-gray-700 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">实际抵押率:</span>
                        <span className="text-orange-400 font-bold">
                          {((simulationResult.collateralValue / simulationResult.borrowValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">实际 LTV:</span>
                        <span className="text-green-400 font-bold">
                          {((simulationResult.borrowValue / simulationResult.collateralValue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 利率信息 */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">个性化利率:</span>
                      <span className="text-green-400 font-semibold">{simulationResult.personalizedRate.toFixed(2)}% APY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">利率优惠:</span>
                      <span className="text-blue-400 font-semibold">↓ {simulationResult.rateDiscount.toFixed(1)}%</span>
                    </div>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">月利息支出:</span>
                      <span className="text-white font-semibold">${simulationResult.monthlyInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">年利息支出:</span>
                      <span className="text-white font-semibold">${simulationResult.annualInterest.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 健康因子 */}
                  <div className="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">健康因子:</span>
                      <span className={`text-xl font-bold ${
                        simulationResult.healthFactor > 1.5 ? 'text-green-400' : 
                        simulationResult.healthFactor > 1.2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {simulationResult.healthFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          simulationResult.healthFactor > 1.5 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                          simulationResult.healthFactor > 1.2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                          'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${Math.min(simulationResult.healthFactor * 50, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {simulationResult.healthFactor > 1.5 
                        ? '✓ 安全：健康因子充足' 
                        : simulationResult.healthFactor > 1.2 
                        ? '⚠ 警告：接近清算阈值' 
                        : '❌ 危险：可能被清算'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          </>
        )}

        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* 资产分布饼图 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">资产分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 资产列表 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">资产详情</h3>
              <div className="space-y-4">
                {userAssets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="font-semibold">{asset.symbol}</span>
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-sm text-gray-400">{asset.amount.toFixed(4)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${asset.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">${assetPrices[asset.symbol as keyof typeof assetPrices]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-4">利率趋势分析</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="aave" stroke="#3B82F6" strokeWidth={2} name="Aave" />
                  <Line type="monotone" dataKey="compound" stroke="#8B5CF6" strokeWidth={2} name="Compound" />
                  <Line type="monotone" dataKey="makerdao" stroke="#10B981" strokeWidth={2} name="MakerDAO" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}