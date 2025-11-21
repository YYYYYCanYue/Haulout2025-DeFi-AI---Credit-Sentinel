// Sui 客户端工具库
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { getNetworkConfig, CONTRACTS, CONTRACT_FUNCTIONS } from './suiConfig';

// 创建 Sui 客户端实例
export function createSuiClient() {
  const config = getNetworkConfig();
  return new SuiClient({ url: config.url });
}

// 全局客户端实例
export const suiClient = createSuiClient();

/**
 * 获取用户的信用凭证 NFT 信息
 * @param address 用户地址
 */
export async function getUserCreditBadge(address: string) {
  try {
    // 获取用户拥有的所有对象
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULES.CREDIT_SCORE_BADGE}::CreditBadgeNFT`,
      },
      options: {
        showContent: true,
        showDisplay: true,
      },
    });

    if (objects.data.length === 0) {
      return { hasNFT: false };
    }

    const nftObject = objects.data[0];
    const content = nftObject.data?.content;

    if (content && 'fields' in content) {
      const fields = content.fields as any;
      return {
        hasNFT: true,
        tokenId: fields.token_id,
        tierId: fields.tier_id,
        lastScore: fields.last_score,
        mintedAt: fields.minted_at,
        updatedAt: fields.updated_at,
        soulbound: fields.soulbound,
        objectId: nftObject.data?.objectId,
      };
    }

    return { hasNFT: false };
  } catch (error) {
    console.error('获取 NFT 信息失败:', error);
    return { hasNFT: false, error };
  }
}

/**
 * 获取指定层级的信息
 * @param stateObjectId GlobalState 对象 ID
 * @param tierId 层级 ID
 */
export async function getTierInfo(stateObjectId: string, tierId: number) {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULES.CREDIT_SCORE_BADGE}::${CONTRACT_FUNCTIONS.CREDIT_SCORE_BADGE.GET_TIER}`,
      arguments: [
        tx.object(stateObjectId),
        tx.pure(tierId, 'u8'),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    return result;
  } catch (error) {
    console.error('获取层级信息失败:', error);
    return null;
  }
}

/**
 * 申领或升级信用凭证 NFT
 * @param signMessage 签名函数
 * @param executeTransaction 执行交易函数
 * @param claimData 申领数据
 */
export async function claimOrUpgradeCreditBadge(
  signAndExecuteTransaction: any,
  configObjectId: string,
  stateObjectId: string,
  claimData: {
    to: string;
    score: string;
    tierId: number;
    nonce: string;
    deadline: string;
    signature: string;
  }
) {
  try {
    const tx = new Transaction();

    console.log('🔨 构建交易...');
    console.log('合约配置:', {
      packageId: CONTRACTS.PACKAGE_ID,
      configObjectId,
      stateObjectId,
      claimData
    });

    // 转换签名为字节数组
    const signatureHex = claimData.signature.startsWith('0x') 
      ? claimData.signature.slice(2) 
      : claimData.signature;
    const signatureBytes = fromHEX(signatureHex);
    
    // 使用 BCS 序列化 vector<u8>
    const signatureBcs = bcs.vector(bcs.u8()).serialize(Array.from(signatureBytes)).toBytes();

    // 调用 claim_or_upgrade 函数
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULES.CREDIT_SCORE_BADGE}::${CONTRACT_FUNCTIONS.CREDIT_SCORE_BADGE.CLAIM_OR_UPGRADE}`,
      arguments: [
        tx.object(configObjectId), // Config 对象
        tx.object(stateObjectId), // GlobalState 对象
        tx.pure.address(claimData.to), // to
        tx.pure.u256(claimData.score), // score
        tx.pure.u8(claimData.tierId), // tier_id
        tx.pure.u256(claimData.nonce), // nonce
        tx.pure.u64(claimData.deadline), // deadline
        tx.pure(signatureBcs), // signature (BCS 序列化的 vector<u8>)
      ],
    });

    console.log('✍️ 请求钱包签名...');

    // 使用新版本的 API（返回 Promise）
    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result: any) => {
            console.log('✅ 交易成功!', result);
            resolve({
              success: true,
              digest: result.digest,
              effects: result.effects,
              objectChanges: result.objectChanges,
            });
          },
          onError: (error: any) => {
            console.error('❌ 交易失败:', error);
            reject({
              success: false,
              error: error.message || '申领 NFT 失败',
            });
          },
        }
      );
    });
  } catch (error: any) {
    console.error('❌ 构建交易失败:', error);
    return {
      success: false,
      error: error.message || '申领 NFT 失败',
    };
  }
}

/**
 * 销毁信用凭证 NFT
 * @param signAndExecuteTransactionBlock 签名并执行交易的函数
 * @param stateObjectId GlobalState 对象 ID
 * @param nftObjectId NFT 对象 ID
 */
export async function burnCreditBadge(
  signAndExecuteTransaction: any,
  stateObjectId: string,
  nftObjectId: string
) {
  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULES.CREDIT_SCORE_BADGE}::${CONTRACT_FUNCTIONS.CREDIT_SCORE_BADGE.BURN}`,
      arguments: [
        tx.object(stateObjectId),
        tx.object(nftObjectId),
      ],
    });

    // 使用新版本的 API
    return new Promise((resolve, reject) => {
      signAndExecuteTransaction(
        {
          transaction: tx,
          options: {
            showEffects: true,
          },
        },
        {
          onSuccess: (result: any) => {
            resolve({
              success: true,
              digest: result.digest,
            });
          },
          onError: (error: any) => {
            reject({
              success: false,
              error: error.message || '销毁 NFT 失败',
            });
          },
        }
      );
    });
  } catch (error: any) {
    console.error('销毁 NFT 失败:', error);
    return {
      success: false,
      error: error.message || '销毁 NFT 失败',
    };
  }
}

/**
 * 获取账户余额
 * @param address 账户地址
 */
export async function getAccountBalance(address: string) {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
    });
    return balance;
  } catch (error) {
    console.error('获取余额失败:', error);
    return null;
  }
}

/**
 * 获取交易详情
 * @param digest 交易哈希
 */
export async function getTransactionDetails(digest: string) {
  try {
    const tx = await suiClient.getTransactionBlock({
      digest,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    return tx;
  } catch (error) {
    console.error('获取交易详情失败:', error);
    return null;
  }
}


