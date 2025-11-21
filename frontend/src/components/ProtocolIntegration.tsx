import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCreditScore } from '@/contexts/CreditScoreContext';
import { useAuth } from '@/contexts/authContext';

// DeFi协议数据
const protocols = [
  {
    id: 1,
    name: 'Aave',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Aave%20logo%2C%20DeFi%20protocol%2C%20blue%20color&sign=3b2620f4f63cb47e8dae44db44e47a7f',
    description: '去中心化借贷协议',
    collateralRate: '80%',
    isIntegrated: true,
    supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH', 'WBTC'],
    baseRate: 2.5,
    maxLTV: 0.8
  },
  {
    id: 2,
    name: 'Compound',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Compound%20logo%2C%20DeFi%20protocol%2C%20purple%20color&sign=cc9adebb402a1918c244866b97e9d4fb',
    description: '算法货币市场协议',
    collateralRate: '80%',
    isIntegrated: true,
    supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH', 'COMP'],
    baseRate: 3.2,
    maxLTV: 0.75
  },
  {
    id: 3,
    name: 'MakerDAO',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=MakerDAO%20logo%2C%20DeFi%20protocol%2C%20green%20color&sign=1f909126fdeb75b10d580a3665031121',
    description: '稳定币发行协议',
    collateralRate: '85%',
    isIntegrated: true,
    supportedAssets: ['ETH', 'WBTC', 'LINK', 'UNI'],
    baseRate: 1.5,
    maxLTV: 0.85
  },
  {
    id: 4,
    name: 'Curve',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Curve%20logo%2C%20DeFi%20protocol%2C%20yellow%20color&sign=99e44ede64cd64879a63cd74939b01dc',
    description: '稳定币兑换协议',
    collateralRate: '90%',
    isIntegrated: false,
    supportedAssets: ['USDC', 'USDT', 'DAI', 'FRAX'],
    baseRate: 1.8,
    maxLTV: 0.9
  },
  {
    id: 5,
    name: 'Uniswap',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Uniswap%20logo%2C%20DeFi%20protocol%2C%20teal%20color&sign=17217d6ff475b6b829f2a0022604a67b',
    description: '去中心化交易所',
    collateralRate: '90%',
    isIntegrated: false,
    supportedAssets: ['ETH', 'USDC', 'USDT', 'UNI'],
    baseRate: 2.0,
    maxLTV: 0.9
  },
  {
    id: 6,
    name: 'SushiSwap',
    logo: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=SushiSwap%20logo%2C%20DeFi%20protocol%2C%20pink%20color&sign=a735cb6059903f08088b6158fce2d494',
    description: '社区驱动的DeFi平台',
    collateralRate: '95%',
    isIntegrated: false,
    supportedAssets: ['ETH', 'USDC', 'SUSHI', 'WBTC'],
    baseRate: 2.8,
    maxLTV: 0.95
  }
];

// 借贷演示组件
function LendingSimulator({ protocol, creditScore }: { protocol: any; creditScore: number }) {
  const [collateralAsset, setCollateralAsset] = useState(protocol.supportedAssets[0]);
  const [borrowAsset, setBorrowAsset] = useState(protocol.supportedAssets[0]);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);

  // 根据信用评分计算个性化抵押率
  const getPersonalizedCollateralRate = (baseRate: number, creditScore: number) => {
    if (creditScore >= 700) return baseRate * 0.8; // 优质用户享受20%优惠
    if (creditScore >= 600) return baseRate * 0.9; // 良好用户享受10%优惠
    if (creditScore >= 500) return baseRate * 0.95; // 一般用户享受5%优惠
    return baseRate; // 其他用户使用标准利率
  };

  const personalizedRate = getPersonalizedCollateralRate(protocol.baseRate, creditScore);
  const maxBorrowAmount = collateralAmount ? parseFloat(collateralAmount) * protocol.maxLTV : 0;
  const healthFactor = borrowAmount && maxBorrowAmount ? maxBorrowAmount / parseFloat(borrowAmount) : 0;

  const handleSimulate = () => {
    if (collateralAmount && borrowAmount) {
      setShowSimulator(true);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowSimulator(!showSimulator)}
        className="w-full py-2.5 rounded-lg font-medium transition-colors bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
      >
        <i className="fa-solid fa-calculator mr-2"></i>
        {showSimulator ? '隐藏借贷器' : '打开借贷器'}
      </button>

      {showSimulator && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
        >
          <h4 className="text-lg font-semibold mb-4 text-blue-400">借贷器</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* 抵押资产 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                抵押资产
              </label>
              <select
                value={collateralAsset}
                onChange={(e) => setCollateralAsset(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                aria-label="选择抵押资产"
              >
                {protocol.supportedAssets.map((asset: string) => (
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                aria-label="选择借贷资产"
              >
                {protocol.supportedAssets.map((asset: string) => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </div>

            {/* 借贷数量 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                借贷数量
              </label>
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="输入借贷数量"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 风险评估 */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-gray-200 mb-3">风险评估</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">标准利率:</span>
                <div className="text-blue-400 font-medium">{protocol.baseRate}%</div>
              </div>
              <div>
                <span className="text-gray-400">个性化利率:</span>
                <div className="text-green-400 font-medium">{personalizedRate.toFixed(2)}%</div>
              </div>
              <div>
                <span className="text-gray-400">最大借贷额:</span>
                <div className="text-yellow-400 font-medium">{maxBorrowAmount.toFixed(2)} {collateralAsset}</div>
              </div>
              <div>
                <span className="text-gray-400">健康因子:</span>
                <div className={`font-medium ${healthFactor > 1.5 ? 'text-green-400' : healthFactor > 1.2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {healthFactor.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 信用评分优惠 */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 mb-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-blue-400">信用评分优惠</h5>
                <p className="text-sm text-gray-300">您的信用评分: {creditScore}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {((protocol.baseRate - personalizedRate) / protocol.baseRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">利率优惠</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={!collateralAmount || !borrowAmount}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-rocket mr-2"></i>
            执行借贷
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function ProtocolIntegration() {
  const { isConnected } = useAuth();
  const { creditScore } = useCreditScore();
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  
  // 使用真实信用评分，未连接时使用默认值
  const effectiveCreditScore = isConnected ? creditScore : 720;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">DeFi协议集成</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          通过您的NFT信用凭证，在各DeFi协议享受个性化抵押率优惠
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: protocol.id * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
              protocol.isIntegrated 
                ? 'border-blue-500/50 hover:shadow-blue-600/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center mr-4 overflow-hidden">
                  <img 
                    src={protocol.logo} 
                    alt={`${protocol.name} logo`} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{protocol.name}</h3>
                  <p className="text-gray-400 text-sm">{protocol.description}</p>
                </div>
              </div>
              {protocol.isIntegrated && (
                <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  已集成
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">特别抵押率</span>
                <span className="font-medium text-blue-400">{protocol.collateralRate}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: protocol.collateralRate }}
                ></div>
              </div>
            </div>

            {/* 协议详情 */}
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">基础利率:</span>
                <span className="text-gray-300">{protocol.baseRate}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">最大LTV:</span>
                <span className="text-gray-300">{(protocol.maxLTV * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">支持资产:</span>
                <span className="text-gray-300">{protocol.supportedAssets.length}种</span>
              </div>
            </div>
            
            {protocol.isIntegrated ? (
              <LendingSimulator protocol={protocol} creditScore={effectiveCreditScore} />
            ) : (
              <button 
                className="w-full py-2.5 rounded-lg font-medium transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
                type="button"
              >
                <i className="fa-solid fa-plug mr-2"></i>集成协议
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* 信用评分影响说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-semibold text-blue-400 mb-4">信用评分如何影响您的借贷体验</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-percentage text-2xl text-green-400"></i>
            </div>
            <h4 className="font-semibold text-gray-200 mb-2">利率优惠</h4>
            <p className="text-sm text-gray-400">高信用评分用户可享受最高20%的利率优惠</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="text-2xl text-blue-400 font-bold">80%</div>
            </div>
            <h4 className="font-semibold text-gray-200 mb-2">抵押率降低</h4>
            <p className="text-sm text-gray-400">相比传统150%抵押率，优质用户仅需80%</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-shield-halved text-2xl text-purple-400"></i>
            </div>
            <h4 className="font-semibold text-gray-200 mb-2">风险控制</h4>
            <p className="text-sm text-gray-400">AI动态监控，实时调整风险评估</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}