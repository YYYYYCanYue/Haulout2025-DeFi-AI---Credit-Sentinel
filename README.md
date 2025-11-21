# DeFi-AI 信用哨兵 | AI Credit Sentinel

> 🏆 基于 AI 信用评分的创新型 DeFi 借贷协议 - Sui 区块链版本

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sui](https://img.shields.io/badge/Blockchain-Sui-blue)](https://sui.io)
[![Move](https://img.shields.io/badge/Language-Move-orange)](https://move-book.com/)

---

## 🌟 项目概述

**DeFi-AI 信用哨兵**是一个革命性的去中心化借贷平台，通过 AI 信用评分系统为优质用户提供**超额抵押优惠**，大幅提升资金利用率，同时保持系统安全性。

### 核心创新

- **AI 驱动信用评分**: 基于链上数据的实时信用评估
- **动态抵押率优惠**: 根据信用等级，最高可享受 **80% 超额抵押优惠**
- **个性化利率**: 优质用户可获得 **最高 20% 利率折扣**
- **NFT 信用凭证**: 链上可验证的信用等级证明
- **跨协议集成**: 可在多个 DeFi 协议中使用

---

## 🎯 核心优势

### 传统 DeFi vs DeFi-AI 对比

| 指标 | 传统 DeFi (Aave) | DeFi-AI (AAA 用户) | 优势 |
|------|------------------|-------------------|------|
| **抵押率** | 133% | **107%** | ✅ 节省 $2,667 |
| **年化利率** | 3.8% | **3.04%** | ✅ 节省 20% |
| **资金效率** | 75.2% | **93.5%** | ✅ 提升 24.3% |
| **借贷灵活性** | 固定 | **动态优化** | ✅ 智能调整 |

**实际案例**: 借贷 $10,000 USDC
- 传统协议需抵押: **$13,333**
- AAA 用户仅需: **$10,666** 
- **节省 $2,667 抵押资金！💰**

---

## 🏗️ 技术架构

### 系统组成

```
┌─────────────────────────────────────────────────┐
│           Frontend (React + Vite)               │
│      @mysten/sui + @mysten/dapp-kit            │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────┴────────────────────────────────┐
│          Backend Services (Node.js)             │
│  ┌──────────────────┐  ┌─────────────────────┐ │
│  │ AI Integration   │  │  Signer Service     │ │
│  │ API (Port 3001)  │  │  (Port 3002)        │ │
│  └──────────────────┘  └─────────────────────┘ │
└────────────────┬────────────────────────────────┘
                 │
                 │ Sui SDK
                 │
┌────────────────┴────────────────────────────────┐
│         Sui Blockchain (Testnet)                │
│  ┌────────────────────────────────────────────┐ │
│  │   Move Smart Contracts                    │ │
│  │   • CreditScoreBadge.move (NFT 发行)      │ │
│  │   • Lock.move (资产锁定)                  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 技术栈

#### 区块链层
- **Sui Blockchain**: 高性能 Layer-1 区块链
- **Move Language**: 安全的智能合约语言
- **Ed25519 Signatures**: 加密签名验证

#### 后端服务
- **Node.js + TypeScript**: 后端运行时
- **Express.js**: API 服务框架
- **@mysten/sui SDK**: Sui 区块链交互
- **AI Model**: 信用评分算法

#### 前端应用
- **React 18**: UI 框架
- **Vite**: 构建工具
- **@mysten/dapp-kit**: Sui 钱包集成
- **TailwindCSS**: 样式框架
- **Framer Motion**: 动画效果
- **Recharts**: 数据可视化

---

## 🚀 快速开始

### 环境要求

- Node.js v16+
- npm 或 pnpm
- Sui CLI (用于密钥管理)
- Sui 钱包扩展 (Suiet / Sui Wallet / Ethos)

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd Competition-Submission
```

#### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

#### 3. 配置后端环境

在 `backend/` 目录创建 `.env` 文件：

```env
# Sui 网络配置
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# 已部署的合约配置
PACKAGE_ID=0x760b3645aa204c466abe4122a258a96bfa68b8074bd410e83e47348158d39f63
CONFIG_OBJECT_ID=0x6a6bfd3187e0d2879e7e9648b34779ec871a79698ce1822cc464452986f3e393
STATE_OBJECT_ID=0x722aea6740d17bdea9cef9fd684111f853298194c33fcfcc17716d6e9612026b
ADMIN_CAP_ID=0x2f63a25b405750f616aed3096b987c449225207e39f7a215f1b1419dd685c6ea

# 签名者私钥（需要配置）
SIGNER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# 服务端口
SIGNER_PORT=3002
API_PORT=3001

# CORS 配置
CORS_ORIGIN=http://localhost:3000
```

#### 4. 启动服务

需要开启 **3 个终端窗口**：

**终端 1 - 签名服务:**
```bash
cd backend
npm run dev:signer
```

**终端 2 - AI 集成 API:**
```bash
cd backend
npm run dev:api
```

**终端 3 - 前端服务:**
```bash
cd frontend
npm run dev
```

#### 5. 访问应用

打开浏览器访问: **http://localhost:3000**

---

## 📋 功能特性

### 🎨 用户功能

#### 1. 信用评分系统
- ✅ 实时链上数据分析
- ✅ AI 驱动评分算法
- ✅ 5 级信用等级 (BB - AAA)
- ✅ 详细评分报告

#### 2. NFT 信用凭证
- ✅ 铸造个性化信用 NFT
- ✅ 动态 Tier 显示
- ✅ 可升级机制
- ✅ 链上可验证

#### 3. 智能借贷平台
- ✅ 个性化抵押率
- ✅ 动态利率优惠
- ✅ 健康因子监控
- ✅ 自动计算建议借贷额

#### 4. 协议集成
- ✅ Aave V3 集成
- ✅ Compound V3 集成
- ✅ MakerDAO 集成
- ✅ 跨平台优惠

### 🔧 管理功能

- ✅ Tier 配置管理
- ✅ 签名者权限管理
- ✅ 评分规则更新
- ✅ 系统参数调整

---

## 💎 信用等级体系

### Tier 等级详情

| Tier | 等级名称 | 评分范围 | 超额部分抵押优惠 | 利率折扣 | NFT 颜色 |
|------|---------|---------|---------|---------|---------|
| **4** | AAA 信用大师 | 700+ | **80%** | **20%** | 🟢 绿色 |
| **3** | AA 信用勇士 | 600-699 | **60%** | **10%** | 🔵 蓝色 |
| **2** | A 信用骑士 | 500-599 | **40%** | **5%** | 🟣 紫色 |
| **1** | BBB 信用卫士 | 400-499 | **0%** | **0%** | 🟡 黄色 |
| **0** | BB 信用哨兵 | <400 | **-10%** | **0%** | 🔴 橙色 |

### 评分维度

```
总分 = 链上活动 (40%) + 资产质量 (30%) + 行为特征 (20%) + 历史记录 (10%)
```

**主要因素:**
- 交易频率和规模
- 总资产价值
- 借贷历史记录
- 协议交互广度
- 资产多样性
- 链上声誉

---

## 🔐 智能合约

### CreditScoreBadge.move

**核心功能:**
- NFT 铸造和升级
- Tier 等级管理
- 签名验证
- Nonce 防重放

**关键函数:**
```move
// 铸造或升级 NFT
public fun claim_or_upgrade(
    config: &mut Config,
    state: &mut GlobalState,
    to: address,
    score: u256,
    tier_id: u8,
    nonce: u256,
    deadline: u64,
    signature: vector<u8>,
    ctx: &mut TxContext,
)

// 销毁 NFT
public fun burn(
    state: &mut GlobalState,
    ctx: &mut TxContext,
)
```

### Lock.move

**功能:**
- 资产锁定管理
- 抵押品托管
- 解锁机制

---

## 📊 API 接口

### AI 集成 API (Port 3001)

#### 1. 计算信用评分
```http
POST /api/score
Content-Type: application/json

{
  "address": "0xba04370ec9588b933c617fbeccdb7572ce57500304a38d32d6f95a0780be54a6",
  "data": {}
}
```

**响应:**
```json
{
  "success": true,
  "creditScore": 750,
  "tier": 4,
  "timestamp": 1700000000
}
```

#### 2. 申领 NFT（完整流程）
```http
POST /api/claim
Content-Type: application/json

{
  "address": "0xba04370ec9588b933c617fbeccdb7572ce57500304a38d32d6f95a0780be54a6",
  "data": {}
}
```

**响应:**
```json
{
  "success": true,
  "creditScore": 750,
  "tier": 4,
  "value": {
    "to": "0xba04...",
    "score": "750",
    "tierId": 4,
    "nonce": "1234567890",
    "deadline": 1700000000
  },
  "signature": "0xabcdef..."
}
```

#### 3. 查询用户 NFT
```http
GET /api/nft/{address}
```

---

## 🎮 使用示例

### 场景 1: 首次用户铸造 NFT

```typescript
// 1. 连接钱包
await connectWallet();

// 2. 获取信用评分
const score = await fetchCreditScore(address);
console.log(`您的信用评分: ${score}`); // 750

// 3. 铸造 NFT
const result = await mintCreditBadge(claimData);
console.log(`NFT 铸造成功! Token ID: ${result.tokenId}`);

// 4. 查看优惠
// AAA 用户借贷 $10,000 仅需抵押 $10,666 (vs Aave $13,333)
```

### 场景 2: 使用优惠借贷（仅为前端演示）

```typescript
// 1. 选择协议
const protocol = "Aave V3";

// 2. 计算个性化参数
const params = calculateLendingParams({
  collateral: 3, // 3 ETH
  creditScore: 750,
  protocol
});

console.log(params);
// {
//   maxBorrow: $9,800,
//   personalizedRate: 3.04%,  // vs 3.8%
//   healthFactor: 1.50,
//   savings: $2,667
// }

// 3. 执行借贷
await executeBorrow(params);
```

---



## 🛡️ 安全性

### 智能合约安全
- ✅ 完整的权限控制
- ✅ Nonce 防重放攻击
- ✅ 时间戳过期验证
- ✅ Ed25519 签名验证

### 系统安全
- ✅ 后端签名服务隔离
- ✅ CORS 跨域保护
- ✅ 环境变量安全管理
- ✅ API 速率限制

### 建议
- ⚠️ 始终保持健康因子 > 1.5
- ⚠️ 分散抵押资产
- ⚠️ 定期监控头寸
- ⚠️ 使用止损策略


