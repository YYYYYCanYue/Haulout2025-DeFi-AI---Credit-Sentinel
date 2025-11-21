// 合约对象 ID 配置
// 这些是部署后创建的共享对象，需要在初始化后填入

/**
 * 重要提示：
 * 在首次部署 credit_score_badge 合约后，需要找到以下对象的 ID：
 * 1. Config 对象 - 合约配置
 * 2. GlobalState 对象 - 全局状态
 * 
 * 查找方法：
 * 1. 通过浏览器查看部署交易的 "Created Objects"
 * 2. 使用 sui client 命令查询
 * 3. 通过代码查询（见下方示例）
 */

export const CONTRACT_OBJECTS = {
  // ✅ 对象 ID 已配置 (2024-11-19)
  CREDIT_SCORE_BADGE: {
    // Config 对象 ID (shared object)
    CONFIG_ID: '0x6a6bfd3187e0d2879e7e9648b34779ec871a79698ce1822cc464452986f3e393',
    
    // GlobalState 对象 ID (shared object)
    STATE_ID: '0x722aea6740d17bdea9cef9fd684111f853298194c33fcfcc17716d6e9612026b',
    
    // AdminCapability 对象 ID (owned by deployer)
    ADMIN_CAP_ID: '0x2f63a25b405750f616aed3096b987c449225207e39f7a215f1b1419dd685c6ea',
  },
  
  LOCK: {
    // Lock 合约的对象 ID（如果需要）
    // 注意：Lock 是每个用户创建自己的实例，这里可以存储示例 ID
  },
};

// 验证对象 ID 是否已配置
export function isContractConfigured(): boolean {
  const { CONFIG_ID, STATE_ID } = CONTRACT_OBJECTS.CREDIT_SCORE_BADGE;
  const defaultId = '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  return CONFIG_ID !== defaultId && STATE_ID !== defaultId;
}

// 获取配置状态提示
export function getConfigurationStatus(): {
  configured: boolean;
  message: string;
} {
  const configured = isContractConfigured();
  
  if (!configured) {
    return {
      configured: false,
      message: '⚠️ 合约对象 ID 未配置，请在 src/lib/contractObjects.ts 中填入 Config 和 GlobalState 的对象 ID',
    };
  }
  
  return {
    configured: true,
    message: '✅ 合约对象已配置',
  };
}

/**
 * 示例：查询对象 ID 的代码
 * 
 * import { suiClient } from './suiClient';
 * import { CONTRACTS } from './suiConfig';
 * 
 * async function findContractObjects(deployerAddress: string) {
 *   // 查询 Config 对象
 *   const configObjects = await suiClient.getOwnedObjects({
 *     owner: deployerAddress,
 *     filter: {
 *       StructType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.MODULES.CREDIT_SCORE_BADGE}::Config`,
 *     },
 *   });
 *   
 *   // 查询 GlobalState 对象（注意：这是共享对象，可能不在 owner 下）
 *   // 对于共享对象，可能需要通过交易历史或事件查询
 *   
 *   console.log('Config ID:', configObjects.data[0]?.data?.objectId);
 * }
 */

