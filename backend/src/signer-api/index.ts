/**
 * Sui 签名服务
 * 用于为信用凭证 NFT 申领请求生成 Ed25519 签名
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.SIGNER_PORT || 3002;

// 中间件
// CORS 配置 - 允许多个源
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', // 允许 API 服务调用
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  // 允许局域网访问
  /^http:\/\/192\.168\.\d+\.\d+:300[0-1]$/,
  /^http:\/\/172\.\d+\.\d+\.\d+:300[0-1]$/,
  /^http:\/\/10\.\d+\.\d+\.\d+:300[0-1]$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如服务器端调用、Postman）
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

// 初始化签名者密钥对
let signerKeypair: Ed25519Keypair;

try {
  const privateKeyHex = process.env.SIGNER_PRIVATE_KEY;
  if (!privateKeyHex) {
    throw new Error('SIGNER_PRIVATE_KEY not configured in .env');
  }
  
  // 从十六进制私钥创建密钥对
  const privateKeyBytes = fromHEX(privateKeyHex);
  signerKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
  
  console.log('✅ Signer initialized with address:', signerKeypair.getPublicKey().toSuiAddress());
} catch (error) {
  console.error('❌ Failed to initialize signer:', error);
  process.exit(1);
}

/**
 * 签名请求数据接口
 */
interface SignRequest {
  to: string;
  score: string | number;
  tierId: number;
  nonce: string | number;
  deadline: number;
}

/**
 * 构造签名消息
 * 需要与合约中的签名验证逻辑匹配
 */
function constructMessage(req: SignRequest): Uint8Array {
  // 构造消息格式：to + score + tierId + nonce + deadline
  // 注意：这里的格式需要与合约中的验证逻辑严格匹配
  
  // 将所有值转换为字符串以便序列化
  const message = {
    to: req.to,
    score: req.score.toString(),
    tierId: req.tierId.toString(),
    nonce: req.nonce.toString(),
    deadline: req.deadline.toString()
  };
  
  // 使用简单的字符串拼接或 JSON 序列化
  const messageStr = JSON.stringify(message);
  const messageBytes = new TextEncoder().encode(messageStr);
  
  return messageBytes;
}

/**
 * 健康检查端点
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sui Signer API',
    network: process.env.SUI_NETWORK || 'testnet',
    signerAddress: signerKeypair.getPublicKey().toSuiAddress()
  });
});

/**
 * 签名端点
 */
app.post('/sign', async (req, res) => {
  try {
    console.log('📝 Received sign request:', JSON.stringify(req.body, null, 2));
    
    const { to, score, tierId, nonce, deadline } = req.body;
    
    // 验证参数
    if (!to || score === undefined || tierId === undefined || 
        nonce === undefined || deadline === undefined) {
      console.error('❌ Missing parameters:', { to, score, tierId, nonce, deadline });
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['to', 'score', 'tierId', 'nonce', 'deadline'],
        received: { to, score, tierId, nonce, deadline }
      });
    }
    
    // 验证地址格式
    if (!to.startsWith('0x') || to.length !== 66) {
      console.error('❌ Invalid address format:', to);
      return res.status(400).json({
        error: 'Invalid Sui address format',
        received: to
      });
    }
    
    // 验证 deadline 未过期
    const currentTime = Math.floor(Date.now() / 1000);
    if (deadline <= currentTime) {
      console.error('❌ Deadline expired:', { deadline, currentTime });
      return res.status(400).json({
        error: 'Deadline has expired',
        deadline,
        currentTime
      });
    }
    
    console.log('✅ Parameters validated');
    
    // 构造签名请求
    const signRequest: SignRequest = {
      to,
      score: String(score),
      tierId: Number(tierId),
      nonce: String(nonce),
      deadline: Number(deadline)
    };
    
    console.log('🔨 Constructing message...');
    
    // 构造消息
    const messageBytes = constructMessage(signRequest);
    
    console.log('✍️ Signing message...');
    
    // 签名（sign() 直接返回 Uint8Array）
    const signatureBytes = await signerKeypair.sign(messageBytes);
    const signature = toHEX(signatureBytes);
    
    console.log('✅ Signature generated');
    
    // 返回签名数据
    const response = {
      success: true,
      value: {
        to: signRequest.to,
        score: signRequest.score,
        tierId: signRequest.tierId,
        nonce: signRequest.nonce,
        deadline: signRequest.deadline
      },
      signature: signature,
      signerAddress: signerKeypair.getPublicKey().toSuiAddress()
    };
    
    res.json(response);
    
    console.log(`✅ Signed request for ${to}, score: ${score}, tier: ${tierId}`);
    
  } catch (error: any) {
    console.error('❌ Signing error:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to sign request',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * 批量签名端点（用于批量处理）
 */
app.post('/sign-batch', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests)) {
      return res.status(400).json({
        error: 'requests must be an array'
      });
    }
    
    const results = await Promise.all(
      requests.map(async (request) => {
        try {
          const messageBytes = constructMessage(request);
          const signatureBytes = await signerKeypair.sign(messageBytes);
          
          return {
            success: true,
            value: request,
            signature: toHEX(signatureBytes)
          };
        } catch (error: any) {
          return {
            success: false,
            value: request,
            error: error.message
          };
        }
      })
    );
    
    res.json({
      success: true,
      results
    });
    
  } catch (error: any) {
    console.error('❌ Batch signing error:', error);
    res.status(500).json({
      error: 'Failed to sign batch requests',
      message: error.message
    });
  }
});

/**
 * 验证签名端点（用于测试）
 */
app.post('/verify', async (req, res) => {
  try {
    const { value, signature } = req.body;
    
    const messageBytes = constructMessage(value);
    const signatureBytes = fromHEX(signature);
    
    // 验证签名（使用 verifyPersonalMessage 方法）
    const publicKey = signerKeypair.getPublicKey();
    const isValid = await publicKey.verifyPersonalMessage(messageBytes, signatureBytes);
    
    res.json({
      valid: isValid,
      signerAddress: publicKey.toSuiAddress()
    });
    
  } catch (error: any) {
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 Sui Signer API started');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔑 Signer: ${signerKeypair.getPublicKey().toSuiAddress()}`);
  console.log(`🌐 Network: ${process.env.SUI_NETWORK || 'testnet'}`);
  console.log(`📦 Package: ${process.env.PACKAGE_ID}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  POST /sign         - Sign single request');
  console.log('  POST /sign-batch   - Sign multiple requests');
  console.log('  POST /verify       - Verify signature');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Signer API...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Signer API...');
  process.exit(0);
});

