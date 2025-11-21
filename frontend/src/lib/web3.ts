// Sui Web3 集成 - 替换原有的 ethers.js 实现
import { suiClient, getUserCreditBadge as getSuiUserCreditBadge } from './suiClient';
import { getExplorerUrl } from './suiConfig';

/**
 * 获取当前网络信息
 */
export async function getCurrentNetwork() {
  try {
    const chainId = await suiClient.getChainIdentifier();
    return {
      chainId: chainId,
      name: 'Sui Network',
      isSui: true,
    };
  } catch (error) {
    console.error('获取网络信息失败:', error);
    throw new Error('无法获取 Sui 网络信息');
  }
}

/**
 * 确保连接到正确的 Sui 网络
 * 注意: Sui 钱包会自动管理网络切换，这里主要用于信息提示
 */
export async function ensureSuiNetwork() {
  try {
    const network = await getCurrentNetwork();
    console.log('当前连接到 Sui 网络:', network);
    return network;
  } catch (error) {
    console.error('Sui 网络检查失败:', error);
    throw new Error('请确保钱包已连接到 Sui 网络');
  }
}

/**
 * 铸造/升级 NFT 信用凭证
 * @param claimData 后端签名数据
 * @param signAndExecuteTransaction 钱包签名并执行交易的函数
 * @param configObjectId Config 对象 ID（可选，如果未提供将使用默认配置）
 * @param stateObjectId GlobalState 对象 ID（可选，如果未提供将使用默认配置）
 */
export async function mintCreditBadge(
  claimData: any,
  signAndExecuteTransaction: any,
  configObjectId?: string,
  stateObjectId?: string
) {
  try {
    if (!signAndExecuteTransaction) {
      throw new Error('钱包未连接或不支持交易签名');
    }

    // 确保连接到 Sui 网络
    await ensureSuiNetwork();

    // 检查对象 ID 配置
    const { CONTRACT_OBJECTS, isContractConfigured, getConfigurationStatus } = await import('./contractObjects');
    const configStatus = getConfigurationStatus();
    
    if (!configStatus.configured && !configObjectId && !stateObjectId) {
      throw new Error(configStatus.message);
    }
    
    // 使用提供的 ID 或默认配置
    const finalConfigId = configObjectId || CONTRACT_OBJECTS.CREDIT_SCORE_BADGE.CONFIG_ID;
    const finalStateId = stateObjectId || CONTRACT_OBJECTS.CREDIT_SCORE_BADGE.STATE_ID;

    // 解构并验证数据
    const { value, signature } = claimData;
    if (!value || !signature) {
      throw new Error('签名数据不完整');
    }

    // 准备交易参数
    const txData = {
      to: value.to,
      score: value.score.toString(),
      tierId: Number(value.tierId),
      nonce: value.nonce.toString(),
      deadline: value.deadline.toString(),
      signature: signature,
    };

    // 动态导入以避免循环依赖
    const { claimOrUpgradeCreditBadge } = await import('./suiClient');
    
    // 执行交易
    const result = await claimOrUpgradeCreditBadge(
      signAndExecuteTransaction,
      finalConfigId,
      finalStateId,
      txData
    );

    if (!result.success) {
      throw new Error(result.error || '铸造 NFT 失败');
    }

    return {
      success: true,
      hash: result.digest,
      explorerUrl: getExplorerUrl('tx', result.digest),
      objectChanges: result.objectChanges,
    };
  } catch (error: any) {
    console.error('铸造 NFT 失败:', error);
    return {
      success: false,
      error: error.message || '铸造 NFT 失败',
    };
  }
}

/**
 * 获取用户拥有的 NFT 信用凭证
 * @param address 用户地址
 * @returns NFT 信息
 */
export async function getUserCreditBadge(address: string) {
  try {
    if (!address) {
      throw new Error('用户地址为空');
    }

    const result = await getSuiUserCreditBadge(address);

    if (result.hasNFT) {
      return {
        hasNFT: true,
        tokenId: result.tokenId,
        tierId: result.tierId,
        lastScore: result.lastScore,
        mintedAt: result.mintedAt,
        updatedAt: result.updatedAt,
        soulbound: result.soulbound,
        objectId: result.objectId,
        explorerUrl: getExplorerUrl('object', result.objectId || ''),
      };
    }

    return { hasNFT: false };
  } catch (error) {
    console.error('获取 NFT 信息失败:', error);
    return { hasNFT: false, error };
  }
}

/**
 * 获取账户余额
 * @param address 用户地址
 */
export async function getAccountBalance(address: string) {
  try {
    const balance = await suiClient.getBalance({ owner: address });
    return {
      balance: balance.totalBalance,
      formattedBalance: (Number(balance.totalBalance) / 1_000_000_000).toFixed(4), // SUI 有 9 位小数
      coinType: balance.coinType,
    };
  } catch (error) {
    console.error('获取余额失败:', error);
    return null;
  }
}

/**
 * 格式化 Sui 地址（缩写显示）
 * @param address 完整地址
 * @param prefixLength 前缀长度
 * @param suffixLength 后缀长度
 */
export function formatSuiAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * 验证 Sui 地址格式
 * @param address 地址字符串
 */
export function isValidSuiAddress(address: string): boolean {
  // Sui 地址是 0x 开头的 64 个十六进制字符（32 字节）
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
  return suiAddressRegex.test(address);
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

// 兼容旧代码的导出
export const switchToAvalancheNetwork = async () => {
  console.warn('已迁移到 Sui 网络，switchToAvalancheNetwork 已弃用');
  return ensureSuiNetwork();
};

export const ensureFuji = async () => {
  console.warn('已迁移到 Sui 网络，ensureFuji 已弃用');
  return ensureSuiNetwork();
};
