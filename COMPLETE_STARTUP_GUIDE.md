# 🚀 DeFi AI NFT - 完整启动指南（Sui 版本）

## 📋 系统要求

- Node.js v16+
- npm 或 pnpm
- Sui CLI（用于密钥管理）
- Sui 钱包（Chrome 扩展）

## ⚡ 快速启动（3 个窗口）

### 窗口 1: 签名服务 🔐

```powershell
cd D:\DeFiAINFTmove\backend
npm install
# 创建 .env 文件并配置（见下方）
npm run dev:signer
```

**预期输出**:
```
✅ Signer initialized with address: 0x...
🚀 Sui Signer API started
📡 Server: http://localhost:3002
```

---

### 窗口 2: AI 集成 API 🤖

```powershell
cd D:\DeFiAINFTmove\backend
npm run dev:api
```

**预期输出**:
```
🚀 AI Integration API started (Sui)
📡 Server: http://localhost:3001
```

---

### 窗口 3: 前端界面 🎨

```powershell
cd D:\DeFiAINFTmove\frontend
npm run dev
```

**预期输出**:
```
  VITE v6.3.5  ready in 2884 ms
  ➜  Local:   http://localhost:3000/
```

---

## 🔧 首次配置

### 1. 后端配置（5 分钟）

#### 1.1 创建 .env 文件

在 `D:\DeFiAINFTmove\backend\` 目录下创建 `.env` 文件：

```env
# Sui 网络配置
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# 合约配置（已部署，无需更改）
PACKAGE_ID=0x760b3645aa204c466abe4122a258a96bfa68b8074bd410e83e47348158d39f63
CONFIG_OBJECT_ID=0x6a6bfd3187e0d2879e7e9648b34779ec871a79698ce1822cc464452986f3e393
STATE_OBJECT_ID=0x722aea6740d17bdea9cef9fd684111f853298194c33fcfcc17716d6e9612026b
ADMIN_CAP_ID=0x2f63a25b405750f616aed3096b987c449225207e39f7a215f1b1419dd685c6ea

# ⚠️ 填入您的 Sui 私钥（见下方说明）
SIGNER_PRIVATE_KEY=

# 服务端口（默认值，可不改）
SIGNER_PORT=3002
API_PORT=3001

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

#### 1.2 获取签名者私钥

**方式 1: 使用现有地址**
```bash
# 查看地址列表
sui client addresses

# 导出私钥（替换 YOUR_ADDRESS）
sui keytool export --key-identity YOUR_ADDRESS
```

**方式 2: 创建新地址**
```bash
sui client new-address ed25519
```

复制输出的私钥（**去掉 0x 前缀**），填入 `.env` 文件的 `SIGNER_PRIVATE_KEY`。

---

### 2. 前端配置（已完成 ✅）

前端已经配置完成，无需额外设置！

---

## 📊 服务架构

```
┌─────────────────────────────────────────────┐
│         前端 (http://localhost:3000)         │
│    React + Vite + @mysten/sui              │
└──────────────┬──────────────────────────────┘
               │
               │ HTTP Requests
               │
┌──────────────┴──────────────────────────────┐
│      AI 集成 API (http://localhost:3001)     │
│    Express + Sui SDK + AI 模型调用         │
└──────────────┬──────────────────────────────┘
               │
               │ 1. 计算评分
               │ 2. 请求签名
               │
┌──────────────┴──────────────────────────────┐
│      签名服务 (http://localhost:3002)        │
│    Express + Ed25519 签名                  │
└──────────────┬──────────────────────────────┘
               │
               │ 签名数据
               │
               ▼
        返回到前端 → 用户铸造 NFT
```

---

## 🎯 功能测试

### 1. 测试服务健康状态

```bash
# 测试签名服务
curl http://localhost:3002/health

# 测试集成 API
curl http://localhost:3001/health

# 测试前端
# 访问 http://localhost:3000
```

---

### 2. 测试完整流程

#### 在浏览器中（推荐）

1. 访问 http://localhost:3000
2. 点击"连接钱包"
3. 选择 Sui Wallet 并连接
4. 点击"申领信用凭证"或"计算评分"
5. 系统自动完成：
   - ✅ 查询链上数据
   - ✅ AI 评分计算
   - ✅ 生成签名
   - ✅ 铸造 NFT

#### 使用 API 测试

```bash
# 1. 计算信用评分
curl -X POST http://localhost:3001/api/score \
  -H "Content-Type: application/json" \
  -d '{
    "address": "YOUR_SUI_ADDRESS",
    "data": {}
  }'

# 2. 申领 NFT（完整流程）
curl -X POST http://localhost:3001/api/claim \
  -H "Content-Type: application/json" \
  -d '{
    "address": "YOUR_SUI_ADDRESS",
    "data": {}
  }'

# 3. 查询用户 NFT
curl http://localhost:3001/api/nft/YOUR_SUI_ADDRESS
```

---

## 🔍 服务状态检查清单

### ✅ 前端服务
- [ ] 访问 http://localhost:3000 正常
- [ ] 可以连接 Sui 钱包
- [ ] 可以查看账户余额
- [ ] UI 界面正常显示

### ✅ 签名服务
- [ ] http://localhost:3002/health 返回 "ok"
- [ ] 日志显示签名者地址
- [ ] 无错误日志

### ✅ AI 集成 API
- [ ] http://localhost:3001/health 返回 "ok"
- [ ] 可以连接 Sui 网络
- [ ] 可以调用签名服务

---

## 📁 项目结构

```
DeFiAINFTmove/
├── backend/                    # 后端服务（新增）
│   ├── src/
│   │   ├── signer-api/        # 签名服务
│   │   └── integration-api/   # AI 集成 API
│   ├── .env                   # 环境变量配置 ⚠️
│   ├── package.json
│   └── README.md
│
├── frontend/                   # 前端（已迁移到 Sui）
│   ├── src/
│   │   ├── lib/
│   │   │   ├── suiClient.ts   # Sui 客户端
│   │   │   ├── suiConfig.ts   # Sui 配置
│   │   │   └── web3.ts        # Web3 集成
│   │   └── ...
│   └── package.json
│
├── contractsmove/              # Move 合约
│   └── sources/
│       ├── CreditScoreBadge.move
│       └── Lock.move
│
├── AI/                        # AI 模型（Python）
│   ├── model/
│   └── Temp Folder/
│
└── COMPLETE_STARTUP_GUIDE.md  # 本文件
```

---

## 🐛 常见问题

### Q1: 签名服务启动失败

**错误**: `SIGNER_PRIVATE_KEY not configured`

**解决**:
1. 确认 `backend/.env` 文件存在
2. 检查 `SIGNER_PRIVATE_KEY` 是否已填写
3. 验证私钥格式（64 个十六进制字符，无 0x 前缀）

---

### Q2: 无法连接 Sui 网络

**错误**: `Network timeout` 或 `Failed to fetch`

**解决**:
1. 检查网络连接
2. 确认 `SUI_RPC_URL` 配置正确
3. 尝试使用备用 RPC: `https://sui-testnet.nodeinfra.com`

---

### Q3: 前端连接钱包失败

**解决**:
1. 安装 Sui Wallet 扩展
2. 解锁钱包
3. 刷新页面
4. 检查钱包网络是否为测试网

---

### Q4: API 返回 404

**解决**:
1. 确认所有服务都已启动
2. 检查端口号是否正确
3. 查看服务日志是否有错误

---

### Q5: 铸造 NFT 失败

**可能原因**:
- Gas 不足
- 签名验证失败
- 对象 ID 错误
- nonce 已使用

**解决**:
1. 获取测试 SUI: https://faucet.sui.io/
2. 检查签名服务日志
3. 验证合约配置
4. 使用新的 nonce

---

## 💡 开发提示

### 日志查看

**签名服务日志**:
- 每次签名请求会打印日志
- 包含签名者地址、请求参数
- 错误会详细显示

**集成 API 日志**:
- 显示评分计算过程
- 显示 AI 服务调用状态
- 记录所有 API 请求

### 修改评分逻辑

编辑 `backend/src/integration-api/index.ts`:

```typescript
function calculateSimpleScore(onChainData: any): number {
  // 自定义评分逻辑
  let score = 400; // 基础分
  
  // 根据余额加分
  const balance = Number(onChainData.balance || 0);
  score += Math.min(Math.floor(balance / 1_000_000_000) * 10, 200);
  
  // 根据持有 NFT 数量加分
  score += Math.min(onChainData.objectCount * 5, 100);
  
  return Math.min(score, 800);
}
```

### 添加 AI 模型集成

如果您有 Python AI 服务运行在 5000 端口：

1. 更新 `backend/.env`:
   ```env
   AI_SERVICE_URL=http://localhost:5000
   ```

2. AI 服务将自动被调用（已在代码中集成）

---

## 🚀 生产部署

### 准备清单

- [ ] 更新 `SUI_NETWORK=mainnet`
- [ ] 使用专业密钥管理（AWS KMS / Vault）
- [ ] 配置 HTTPS
- [ ] 添加速率限制
- [ ] 设置监控和日志
- [ ] 进行安全审计
- [ ] 压力测试

### 环境变量（生产）

```env
SUI_NETWORK=mainnet
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
CORS_ORIGIN=https://your-domain.com
# ... 其他配置
```

---

## 📚 相关文档

### 后端
- [Backend README](./backend/README.md) - 完整API文档
- [Backend Quickstart](./backend/QUICKSTART.md) - 5分钟快速开始
- [ENV Config](./backend/ENV_CONFIG.md) - 环境变量详解

### 前端
- [Frontend START_HERE](./frontend/START_HERE.md) - 前端快速开始
- [Sui Integration Guide](./frontend/SUI_INTEGRATION_GUIDE.md) - API集成
- [Troubleshooting](./frontend/TROUBLESHOOTING.md) - 故障排除

### Sui 官方
- [Sui 文档](https://docs.sui.io/)
- [TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Move 语言](https://move-book.com/)

---

## 🎉 完成！

现在您拥有：
- ✅ 完整的前端界面
- ✅ 签名服务（Ed25519）
- ✅ AI 集成 API
- ✅ NFT 铸造功能
- ✅ 信用评分系统

**立即访问**: http://localhost:3000

**开始测试**: 连接钱包 → 计算评分 → 铸造 NFT

祝您使用愉快！🚀



