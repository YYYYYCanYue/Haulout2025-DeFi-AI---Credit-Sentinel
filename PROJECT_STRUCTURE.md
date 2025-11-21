# 📁 项目结构说明

## 目录组织

```
Competition-Submission/
│
├── frontend/                      # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── components/           # UI 组件
│   │   │   ├── Navigation.tsx    # 导航栏（钱包连接、切换）
│   │   │   ├── WalletSelector.tsx # 钱包选择器
│   │   │   ├── NFTCertificate.tsx # NFT 信用凭证展示
│   │   │   ├── CreditScoreCard.tsx # 信用评分卡片
│   │   │   ├── LendingDemo.tsx   # 借贷演示组件
│   │   │   ├── ProtocolIntegration.tsx # 协议集成
│   │   │   └── ...
│   │   │
│   │   ├── pages/                # 页面组件
│   │   │   ├── Home.tsx          # 首页（评分、铸造）
│   │   │   ├── LendingSimulator.tsx # 借贷模拟器
│   │   │   ├── About.tsx         # 关于页面
│   │   │   ├── Documentation.tsx # 文档页面
│   │   │   └── API.tsx           # API 文档
│   │   │
│   │   ├── contexts/             # React Context
│   │   │   ├── AuthProvider.tsx  # 钱包认证
│   │   │   ├── authContext.ts
│   │   │   └── CreditScoreContext.tsx # 信用评分全局状态
│   │   │
│   │   ├── lib/                  # 工具库
│   │   │   ├── suiClient.ts      # Sui 链交互
│   │   │   ├── suiConfig.ts      # Sui 配置
│   │   │   ├── suiProvider.tsx   # Sui Provider
│   │   │   ├── web3.ts           # Web3 集成
│   │   │   └── contractObjects.ts # 合约对象 ID
│   │   │
│   │   ├── App.tsx               # 应用根组件
│   │   ├── main.tsx              # 入口文件
│   │   └── index.css             # 全局样式
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                       # 后端服务 (Node.js + TypeScript)
│   ├── src/
│   │   ├── signer-api/           # 签名服务 (Port 3002)
│   │   │   └── index.ts          # Ed25519 签名逻辑
│   │   │
│   │   └── integration-api/      # AI 集成 API (Port 3001)
│   │       └── index.ts          # 信用评分、NFT 查询
│   │
│   ├── scripts/
│   │   └── init-tiers.ts         # Tier 初始化脚本
│   │
│   ├── .env.example              # 环境变量模板
│   ├── package.json
│   └── tsconfig.json
│
├── contractsmove/                 # Move 智能合约
│   ├── sources/
│   │   ├── CreditScoreBadge.move # 信用 NFT 合约
│   │   └── Lock.move             # 资产锁定合约
│   │
│   └── Move.toml                 # Move 项目配置
│
├── AI/                           # AI 模型文件
│   └── model/
│       ├── prediction_models/
│       │   ├── imputer.pkl       # 数据填充器
│       │   ├── random_forest_classifier.pkl # 随机森林模型
│       │   └── scaler.pkl        # 数据标准化器
│       │
│       ├── scan_stats.csv        # 训练数据统计
│       └── train_base.py         # 模型训练脚本
│
├── COMPLETE_STARTUP_GUIDE.md     # 完整启动指南
├── DeFi-AI信用哨兵-超额抵押优惠机制.md # 机制详解
├── README.md                     # 项目说明
├── LICENSE                       # MIT 开源协议
└── .gitignore                    # Git 忽略规则
```

---

## 核心模块说明

### 1. 前端应用 (`frontend/`)

#### 主要功能
- 钱包连接与管理
- 信用评分查询
- NFT 铸造与升级
- 借贷模拟器
- 协议集成展示

#### 关键技术
- **React 18** + **TypeScript**
- **@mysten/dapp-kit**: Sui 钱包集成
- **@mysten/sui**: Sui SDK
- **Vite**: 快速构建工具
- **TailwindCSS**: 原子化 CSS
- **Framer Motion**: 动画库
- **Recharts**: 数据可视化

#### 启动命令
```bash
cd frontend
npm install
npm run dev
```

---

### 2. 后端服务 (`backend/`)

#### 2.1 签名服务 (`signer-api/`)

**功能**:
- Ed25519 签名生成
- 签名验证
- Nonce 管理

**端口**: 3002

**启动命令**:
```bash
cd backend
npm run dev:signer
```

#### 2.2 AI 集成 API (`integration-api/`)

**功能**:
- 链上数据查询
- AI 信用评分计算
- NFT 申领数据生成
- NFT 查询服务

**端口**: 3001

**启动命令**:
```bash
cd backend
npm run dev:api
```

---

### 3. 智能合约 (`contractsmove/`)

#### 3.1 CreditScoreBadge.move

**功能**:
- NFT 铸造 (`claim_or_upgrade`)
- NFT 升级（评分提升时）
- NFT 销毁 (`burn`)
- Tier 管理 (`set_tier`)
- 签名验证

**核心结构**:
```move
struct Config {
    signer: address,          // 签名者地址
    next_token_id: u256,      // 下一个 Token ID
}

struct GlobalState {
    tokens: Table<u256, TokenData>,        // Token 数据
    token_of: Table<address, u256>,        // 地址 -> Token ID
    tiers: Table<u8, TierInfo>,            // Tier 配置
    used_nonces: Table<address, Table<u256, bool>>, // Nonce 记录
}

struct TokenData {
    owner: address,           // 所有者
    tier_id: u8,             // Tier 等级
    last_score: u256,        // 最新评分
    minted_at: u64,          // 铸造时间
    updated_at: u64,         // 更新时间
}
```

#### 3.2 Lock.move

**功能**:
- 资产锁定
- 抵押品管理
- 解锁机制

---

### 4. AI 模型 (`AI/`)

#### 模型文件
- `random_forest_classifier.pkl`: 随机森林分类器
- `imputer.pkl`: 缺失值填充器
- `scaler.pkl`: 特征标准化器

#### 训练脚本
- `train_base.py`: 基础训练脚本
- `scan_stats.csv`: 训练数据统计

#### 使用方式
后端 API 可以加载这些模型进行信用评分计算：

```python
import pickle

# 加载模型
with open('AI/model/prediction_models/random_forest_classifier.pkl', 'rb') as f:
    model = pickle.load(f)

# 预测信用评分
score = model.predict(features)
```

---

## 数据流

### 用户铸造 NFT 流程

```
1. 用户连接钱包
   ↓
2. 前端调用 /api/claim
   ↓
3. Integration API:
   ├─→ 查询链上数据 (余额、交易历史)
   ├─→ 计算信用评分 (AI 模型)
   └─→ 请求签名服务
   ↓
4. Signer API:
   ├─→ 生成 nonce
   ├─→ 构建消息
   └─→ Ed25519 签名
   ↓
5. 返回前端:
   {
     creditScore: 750,
     tier: 4,
     signature: "0x...",
     deadline: timestamp
   }
   ↓
6. 用户确认交易
   ↓
7. 前端构建 Move 交易
   ↓
8. 调用 claim_or_upgrade
   ↓
9. 合约验证签名
   ↓
10. NFT 铸造成功 ✅
```

---

## 环境变量

### 后端 (`.env`)

```env
# Sui 网络
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# 合约地址
PACKAGE_ID=0x760b...
CONFIG_OBJECT_ID=0x6a6b...
STATE_OBJECT_ID=0x722a...
ADMIN_CAP_ID=0x2f63...

# 签名者私钥
SIGNER_PRIVATE_KEY=982e2d...

# 端口
SIGNER_PORT=3002
API_PORT=3001

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 部署信息

### Sui 测试网合约

- **网络**: Sui Testnet
- **Package ID**: `0x760b3645aa204c466abe4122a258a96bfa68b8074bd410e83e47348158d39f63`
- **Transaction**: `ELNwCNtQa8QFAuQYaDDFKRDuGBTDVPNKgNZuvoWFxR57`

### 对象 ID

| 对象 | ID | 类型 |
|------|----|----|
| Config | `0x6a6b...e393` | Shared |
| GlobalState | `0x722a...026b` | Shared |
| AdminCapability | `0x2f63...c6ea` | Owned |

---

## 开发指南

### 添加新功能

#### 1. 前端新页面
```bash
cd frontend/src/pages
# 创建 NewPage.tsx
# 在 App.tsx 中添加路由
```

#### 2. 后端新 API
```typescript
// backend/src/integration-api/index.ts
app.post('/api/new-endpoint', async (req, res) => {
  // 实现逻辑
});
```

#### 3. 新合约函数
```move
// contractsmove/sources/CreditScoreBadge.move
public fun new_function(
    config: &mut Config,
    ctx: &mut TxContext
) {
    // 实现逻辑
}
```

### 测试

```bash
# 前端
cd frontend
npm run test

# 后端
cd backend
npm run test

# 合约
cd contractsmove
sui move test
```

---

## 故障排查

### 常见问题

#### 1. 前端启动失败
```bash
# 清理依赖
rm -rf node_modules package-lock.json
npm install
```

#### 2. 后端连接失败
```bash
# 检查环境变量
cat backend/.env

# 检查端口占用
netstat -ano | findstr "3001"
netstat -ano | findstr "3002"
```

#### 3. 合约调用失败
- 检查 Gas 余额
- 验证对象 ID
- 查看交易日志

---

## 性能优化

### 前端
- 使用 React.memo 减少重渲染
- 懒加载路由组件
- 图片压缩和 CDN

### 后端
- 添加 Redis 缓存
- 数据库查询优化
- API 速率限制

### 合约
- 批量操作优化
- 减少存储读写
- 事件优化

---

## 安全建议

### 1. 私钥管理
- ⚠️ 永远不要提交 `.env` 文件
- 使用环境变量管理敏感信息
- 生产环境使用 KMS

### 2. 合约安全
- 完整的权限检查
- Nonce 防重放
- 时间戳验证

### 3. API 安全
- CORS 配置
- 速率限制
- 输入验证

---

## 更新日志

### v1.0.0 (2024-11-20)
- ✅ 完成 Sui 智能合约
- ✅ 前端 dApp 开发
- ✅ 后端 API 服务
- ✅ AI 信用评分系统

---

**文档维护**: DeFi-AI 开发团队  
**最后更新**: 2024-11-21

