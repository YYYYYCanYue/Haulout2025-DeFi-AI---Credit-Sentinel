/**
 * 初始化信用凭证合约的 Tier（层级）
 * 
 * 运行方式:
 * ts-node backend/scripts/init-tiers.ts
 */

import dotenv from 'dotenv';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';

// 加载环境变量
dotenv.config({ path: './backend/.env' });

// 配置
const PACKAGE_ID = process.env.PACKAGE_ID!;
const CONFIG_ID = process.env.CONFIG_OBJECT_ID!;
const STATE_ID = process.env.STATE_OBJECT_ID!;
const ADMIN_CAP_ID = process.env.ADMIN_CAP_ID!;
const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY!;
const RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

// 定义 5 个层级
const TIERS = [
  {
    id: 0,
    name: 'BB - 信用哨兵',
    minScore: 300,
    uri: 'ipfs://QmTier0BB'
  },
  {
    id: 1,
    name: 'BBB - 信用卫士',
    minScore: 400,
    uri: 'ipfs://QmTier1BBB'
  },
  {
    id: 2,
    name: 'A - 信用骑士',
    minScore: 500,
    uri: 'ipfs://QmTier2A'
  },
  {
    id: 3,
    name: 'AA - 信用勇士',
    minScore: 600,
    uri: 'ipfs://QmTier3AA'
  },
  {
    id: 4,
    name: 'AAA - 信用大师',
    minScore: 700,
    uri: 'ipfs://QmTier4AAA'
  }
];

async function main() {
  console.log('🚀 开始初始化 Tier...\n');

  // 验证环境变量
  if (!PACKAGE_ID || !STATE_ID || !ADMIN_CAP_ID || !PRIVATE_KEY) {
    console.error('❌ 缺少必要的环境变量');
    console.error('请确保 .env 文件包含:');
    console.error('  - PACKAGE_ID');
    console.error('  - STATE_OBJECT_ID');
    console.error('  - ADMIN_CAP_ID');
    console.error('  - SIGNER_PRIVATE_KEY');
    process.exit(1);
  }

  console.log('📋 配置信息:');
  console.log(`  Package ID: ${PACKAGE_ID}`);
  console.log(`  State ID: ${STATE_ID}`);
  console.log(`  Admin Cap ID: ${ADMIN_CAP_ID}`);
  console.log(`  RPC URL: ${RPC_URL}\n`);

  // 初始化 Sui 客户端
  const client = new SuiClient({ url: RPC_URL });

  // 从私钥创建密钥对
  const privateKeyBytes = fromHEX(PRIVATE_KEY);
  const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
  const signerAddress = keypair.getPublicKey().toSuiAddress();

  console.log(`🔑 Signer Address: ${signerAddress}\n`);

  // 检查 Gas 余额
  const balance = await client.getBalance({ owner: signerAddress });
  console.log(`💰 余额: ${Number(balance.totalBalance) / 1_000_000_000} SUI\n`);

  if (Number(balance.totalBalance) === 0) {
    console.error('❌ 账户余额为 0，请先充值 SUI 以支付 Gas 费用');
    console.error(`访问 https://faucet.testnet.sui.io/ 获取测试币`);
    process.exit(1);
  }

  // 为每个 Tier 创建交易
  for (const tier of TIERS) {
    try {
      console.log(`⚙️  设置 Tier ${tier.id}: ${tier.name} (最低分数: ${tier.minScore})...`);

      const tx = new Transaction();

      // 调用 set_tier 函数
      const uriBytes = new TextEncoder().encode(tier.uri);
      const uriBcs = bcs.vector(bcs.u8()).serialize(Array.from(uriBytes)).toBytes();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::credit_score_badge::set_tier`,
        arguments: [
          tx.object(ADMIN_CAP_ID),     // admin_cap
          tx.object(STATE_ID),          // state
          tx.pure.u8(tier.id),          // tier_id
          tx.pure.u256(tier.minScore),  // min_score
          tx.pure(uriBcs),              // uri (BCS serialized vector<u8>)
        ],
      });

      // 签名并执行交易
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      if (result.effects?.status.status === 'success') {
        console.log(`✅ Tier ${tier.id} 设置成功!`);
        console.log(`   交易哈希: ${result.digest}`);
      } else {
        console.error(`❌ Tier ${tier.id} 设置失败:`, result.effects?.status.error);
      }

      // 等待一小段时间，避免 nonce 冲突
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`❌ Tier ${tier.id} 设置时出错:`, error.message);
    }

    console.log('');
  }

  console.log('🎉 所有 Tier 初始化完成!\n');

  // 验证 Tier 设置
  console.log('🔍 验证 Tier 配置...');
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::credit_score_badge::list_tier_ids`,
      arguments: [tx.object(STATE_ID)],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: signerAddress,
    });

    console.log('✅ Tier 配置验证成功');
    console.log('已配置的 Tier IDs:', result);
  } catch (error: any) {
    console.error('⚠️  无法验证 Tier 配置:', error.message);
  }

  console.log('\n✨ 初始化完成！现在可以铸造 NFT 了。');
}

main().catch((error) => {
  console.error('\n❌ 发生错误:', error);
  process.exit(1);
});


