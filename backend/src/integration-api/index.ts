/**
 * AI 集成 API - Sui 版本
 * 连接前端、AI 模型和签名服务
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { SuiClient } from '@mysten/sui/client';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// 中间件
// CORS 配置 - 允许多个源
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  // 允许局域网访问
  /^http:\/\/192\.168\.\d+\.\d+:3000$/,
  /^http:\/\/172\.\d+\.\d+\.\d+:3000$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);
    
    // 检查是否在允许列表中
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// 初始化 Sui 客户端
const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
});

// 配置
const SIGNER_API_URL = `http://localhost:${process.env.SIGNER_PORT || 3002}`;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

/**
 * 健康检查
 */
app.get('/health', async (req, res) => {
  try {
    const chainId = await suiClient.getChainIdentifier();
    
    res.json({
      status: 'ok',
      service: 'AI Integration API (Sui)',
      network: process.env.SUI_NETWORK || 'testnet',
      chainId,
      packageId: process.env.PACKAGE_ID
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * 获取用户信用评分
 * 调用 AI 模型进行评分
 */
app.post('/api/score', async (req, res) => {
  try {
    const { address, data } = req.body;
    
    if (!address) {
      return res.status(400).json({
        error: 'Address is required'
      });
    }
    
    console.log(`📊 Calculating credit score for ${address}...`);
    
    // 1. 获取链上数据（如果需要）
    let onChainData = {};
    try {
      const balance = await suiClient.getBalance({ owner: address });
      const objects = await suiClient.getOwnedObjects({ owner: address });
      
      onChainData = {
        balance: balance.totalBalance,
        objectCount: objects.data.length
      };
    } catch (error) {
      console.warn('⚠️ Failed to fetch on-chain data:', error);
    }
    
    // 2. 调用 AI 模型进行评分
    // 注意：这里假设您的 AI 服务运行在 Python 服务器上
    let creditScore = 600; // 默认分数
    let tier = 1; // 默认层级
    
    try {
      // 如果有 AI 服务，调用它
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
        address,
        onChainData,
        additionalData: data
      }, {
        timeout: 10000
      });
      
      creditScore = aiResponse.data.score || 600;
      tier = calculateTier(creditScore);
      
      console.log(`✅ AI Score: ${creditScore}, Tier: ${tier}`);
    } catch (error) {
      console.warn('⚠️ AI service unavailable, using default score');
      // 如果 AI 服务不可用，使用基于链上数据的简单评分
      creditScore = calculateSimpleScore(onChainData);
      tier = calculateTier(creditScore);
    }
    
    res.json({
      success: true,
      address,
      creditScore,
      tier,
      onChainData
    });
    
  } catch (error: any) {
    console.error('❌ Score calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate credit score',
      message: error.message
    });
  }
});

/**
 * 申领信用凭证 NFT
 * 1. 计算信用评分
 * 2. 获取签名
 * 3. 返回完整的申领数据
 */
app.post('/api/claim', async (req, res) => {
  try {
    const { address, data } = req.body;
    
    if (!address) {
      return res.status(400).json({
        error: 'Address is required'
      });
    }
    
    console.log(`🎫 Processing claim request for ${address}...`);
    
    // 1. 计算信用评分（直接调用逻辑，不通过 HTTP）
    let creditScore = 600;
    let tier = 1;
    let onChainData = {};
    
    try {
      // 获取链上数据
      const balance = await suiClient.getBalance({ owner: address });
      const objects = await suiClient.getOwnedObjects({ owner: address });
      
      onChainData = {
        balance: balance.totalBalance,
        objectCount: objects.data.length
      };
      
      // 尝试调用 AI 服务
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
          address,
          onChainData,
          additionalData: data
        }, {
          timeout: 5000
        });
        
        creditScore = aiResponse.data.score || 600;
        tier = calculateTier(creditScore);
        console.log(`✅ AI Score: ${creditScore}, Tier: ${tier}`);
      } catch (aiError) {
        console.warn('⚠️ AI service unavailable, using simple score');
        creditScore = calculateSimpleScore(onChainData);
        tier = calculateTier(creditScore);
      }
    } catch (chainError: any) {
      console.warn('⚠️ Failed to fetch on-chain data:', chainError.message);
      // 使用默认分数
      creditScore = 600;
      tier = calculateTier(creditScore);
    }
    
    console.log(`📊 Score calculated: ${creditScore}, Tier: ${tier}`);
    
    // 2. 构造签名请求
    const nonce = Date.now().toString();
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
    
    const signRequest = {
      to: address,
      score: creditScore,
      tierId: tier,
      nonce,
      deadline
    };
    
    // 3. 获取签名
    console.log(`🔐 Requesting signature from ${SIGNER_API_URL}/sign...`);
    let signResponse;
    try {
      signResponse = await axios.post(
        `${SIGNER_API_URL}/sign`,
        signRequest,
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (signError: any) {
      console.error('❌ Signature service error:', signError.message);
      if (signError.response) {
        console.error('Response data:', signError.response.data);
      }
      throw new Error(`Signature service error: ${signError.message}`);
    }
    
    if (!signResponse.data.success) {
      console.error('❌ Signature failed:', signResponse.data);
      throw new Error('Failed to obtain signature');
    }
    
    console.log('✅ Signature obtained successfully');
    
    // 4. 返回完整数据
    const result = {
      success: true,
      value: signResponse.data.value,
      signature: signResponse.data.signature,
      creditScore,
      tier,
      contractInfo: {
        packageId: process.env.PACKAGE_ID,
        configId: process.env.CONFIG_OBJECT_ID,
        stateId: process.env.STATE_OBJECT_ID
      }
    };
    
    console.log(`✅ Claim data ready for ${address}`);
    
    res.json(result);
    
  } catch (error: any) {
    console.error('❌ Claim processing error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to process claim request',
      message: error.message,
      details: error.response?.data || error.toString()
    });
  }
});

/**
 * 查询用户 NFT 信息
 */
app.get('/api/nft/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // 查询用户的 NFT
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${process.env.PACKAGE_ID}::credit_score_badge::CreditBadgeNFT`
      },
      options: {
        showContent: true,
        showDisplay: true
      }
    });
    
    if (objects.data.length === 0) {
      return res.json({
        hasNFT: false
      });
    }
    
    const nft = objects.data[0];
    const content = nft.data?.content as any;
    
    res.json({
      hasNFT: true,
      objectId: nft.data?.objectId,
      content: content?.fields || {},
      display: nft.data?.display
    });
    
  } catch (error: any) {
    console.error('❌ NFT query error:', error);
    res.status(500).json({
      error: 'Failed to query NFT',
      message: error.message
    });
  }
});

/**
 * 获取合约配置信息
 */
app.get('/api/config', (req, res) => {
  res.json({
    packageId: process.env.PACKAGE_ID,
    configId: process.env.CONFIG_OBJECT_ID,
    stateId: process.env.STATE_OBJECT_ID,
    adminCapId: process.env.ADMIN_CAP_ID,
    network: process.env.SUI_NETWORK || 'testnet',
    rpcUrl: process.env.SUI_RPC_URL
  });
});

/**
 * 工具函数：计算层级
 */
function calculateTier(score: number): number {
  if (score >= 700) return 4; // AAA
  if (score >= 600) return 3; // AA
  if (score >= 500) return 2; // A
  if (score >= 400) return 1; // BBB
  return 0; // BB
}

/**
 * 工具函数：简单评分（当 AI 服务不可用时）
 */
function calculateSimpleScore(onChainData: any): number {
  const balance = Number(onChainData.balance || 0);
  const objectCount = Number(onChainData.objectCount || 0);
  
  // 简单的评分逻辑
  let score = 400; // 基础分
  
  // 根据余额加分（每 1 SUI = 10分，最多 200分）
  score += Math.min(Math.floor(balance / 1_000_000_000) * 10, 200);
  
  // 根据对象数量加分（每个对象 5分，最多 100分）
  score += Math.min(objectCount * 5, 100);
  
  return Math.min(score, 800);
}

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 AI Integration API started (Sui)');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 Network: ${process.env.SUI_NETWORK || 'testnet'}`);
  console.log(`📦 Package: ${process.env.PACKAGE_ID}`);
  console.log(`🔐 Signer API: ${SIGNER_API_URL}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health          - Health check');
  console.log('  POST /api/score       - Calculate credit score');
  console.log('  POST /api/claim       - Process claim request');
  console.log('  GET  /api/nft/:address - Query user NFT');
  console.log('  GET  /api/config      - Get contract config');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Integration API...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Integration API...');
  process.exit(0);
});

