import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreditScore } from '@/contexts/CreditScoreContext';
import { useAuth } from '@/contexts/authContext';

export default function LendingDemo() {
  const { isConnected } = useAuth();
  const { creditScore } = useCreditScore();
  const [collateralAmount, setCollateralAmount] = useState('3');
  const [borrowAmount, setBorrowAmount] = useState('10000');
  
  // 使用真实信用评分，未连接时使用默认值
  const effectiveCreditScore = isConnected ? creditScore : 720;

  // 获取信用层级和优惠
  const getCreditTierInfo = (score: number) => {
    if (score >= 700) return { tier: 'AAA', discount: 0.80, color: 'text-green-400' };
    if (score >= 600) return { tier: 'AA', discount: 0.60, color: 'text-blue-400' };
    if (score >= 500) return { tier: 'A', discount: 0.40, color: 'text-purple-400' };
    if (score >= 400) return { tier: 'BBB', discount: 0, color: 'text-yellow-400' };
    return { tier: 'BB', discount: -0.10, color: 'text-orange-400' };
  };

  // 计算个性化利率（基于 Aave 基准）
  const getPersonalizedRate = (baseRate: number, score: number) => {
    if (score >= 700) return baseRate * 0.8;  // 20% 利率优惠
    if (score >= 600) return baseRate * 0.9;  // 10% 利率优惠
    if (score >= 500) return baseRate * 0.95; // 5% 利率优惠
    return baseRate;
  };

  const ETH_PRICE = 3500;
  const baseRate = 3.8; // Aave 基准利率
  const personalizedRate = getPersonalizedRate(baseRate, effectiveCreditScore);
  const tierInfo = getCreditTierInfo(effectiveCreditScore);
  
  const collateralValue = parseFloat(collateralAmount) * ETH_PRICE;
  const borrowValue = parseFloat(borrowAmount);
  
  // DeFi-AI 抵押率计算：基础 100% + 超额部分 × (1 - 优惠比例)
  const excessAmount = Math.max(0, borrowValue - collateralValue);
  const requiredCollateral = borrowValue + excessAmount * (1 - tierInfo.discount);
  const actualCollateralRatio = (requiredCollateral / borrowValue) * 100;
  
  // 传统 DeFi (Aave) 抵押率
  const traditionalCollateralRatio = 133; // Aave 133%
  const traditionalRequired = borrowValue * (traditionalCollateralRatio / 100);
  
  const healthFactor = (collateralValue * 0.80) / borrowValue; // 基于 80% 清算阈值
  const rateDiscount = ((baseRate - personalizedRate) / baseRate) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-blue-400">智能借贷体验</h3>
          <p className="text-gray-400 text-sm mt-1">基于信用评分的个性化借贷</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">您的信用等级</div>
          <div className={`text-2xl font-bold ${tierInfo.color}`}>{tierInfo.tier}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            抵押ETH数量
          </label>
          <input
            type="number"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="输入ETH数量"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            aria-label="抵押ETH数量"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            借贷USDC数量
          </label>
          <input
            type="number"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="输入USDC数量"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            aria-label="借贷USDC数量"
          />
        </div>
      </div>

      {/* 对比展示 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* DeFi-AI */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-4 border border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-semibold text-sm">DeFi-AI 智能借贷</span>
            <i className="fa-solid fa-sparkles text-green-400"></i>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">需要抵押:</span>
              <span className="text-white font-semibold">${requiredCollateral.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">抵押率:</span>
              <span className="text-green-400 font-bold">{actualCollateralRatio.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">个性化利率:</span>
              <span className="text-green-400 font-semibold">{personalizedRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        {/* 传统 DeFi */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg p-4 border border-red-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 font-semibold text-sm">传统 DeFi (Aave)</span>
            <i className="fa-solid fa-lock text-red-400"></i>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">需要抵押:</span>
              <span className="text-white font-semibold">${traditionalRequired.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">抵押率:</span>
              <span className="text-red-400 font-bold">{traditionalCollateralRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">基础利率:</span>
              <span className="text-red-400 font-semibold">{baseRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 优势统计 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-green-700/30">
          <div className="text-xs text-gray-400 mb-1">抵押节省</div>
          <div className="text-lg font-bold text-green-400">
            ${(traditionalRequired - requiredCollateral).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-blue-700/30">
          <div className="text-xs text-gray-400 mb-1">利率优惠</div>
          <div className="text-lg font-bold text-blue-400">
            {rateDiscount.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">健康因子</div>
          <div className={`text-lg font-bold ${
            healthFactor > 1.5 ? 'text-green-400' : 
            healthFactor > 1.2 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {healthFactor.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
        <div className="flex items-center text-sm text-gray-300">
          <i className="fa-solid fa-info-circle text-blue-400 mr-2"></i>
          <span>相比传统 DeFi，您可节省 <span className="text-green-400 font-bold">${(traditionalRequired - requiredCollateral + borrowValue * (baseRate - personalizedRate) / 100).toLocaleString(undefined, {maximumFractionDigits: 0})}</span></span>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg">
          <i className="fa-solid fa-rocket mr-2"></i>
          立即体验
        </button>
      </div>
    </motion.div>
  );
} 