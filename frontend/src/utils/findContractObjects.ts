/**
 * 查找合约对象 ID 的工具脚本
 * 运行此脚本以找到 Config 和 GlobalState 对象的 ID
 */

import { suiClient } from '../lib/suiClient';
import { CONTRACTS } from '../lib/suiConfig';

/**
 * 通过部署交易查找创建的对象
 */
export async function findObjectsByTransaction(txDigest: string) {
  try {
    console.log('🔍 查询交易:', txDigest);
    
    const tx = await suiClient.getTransactionBlock({
      digest: txDigest,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    const objectChanges = tx.objectChanges;
    if (!objectChanges) {
      console.log('❌ 未找到对象变化');
      return;
    }

    console.log('\n📦 创建的对象:');
    const createdObjects: any[] = [];

    for (const change of objectChanges) {
      if (change.type === 'created') {
        const obj = {
          objectId: change.objectId,
          objectType: change.objectType,
          owner: change.owner,
        };
        createdObjects.push(obj);
        
        // 检查是否是我们需要的对象
        if (change.objectType.includes('Config')) {
          console.log('\n✅ 找到 Config 对象:');
          console.log(`   ID: ${change.objectId}`);
          console.log(`   类型: ${change.objectType}`);
        } else if (change.objectType.includes('GlobalState')) {
          console.log('\n✅ 找到 GlobalState 对象:');
          console.log(`   ID: ${change.objectId}`);
          console.log(`   类型: ${change.objectType}`);
        } else if (change.objectType.includes('AdminCapability')) {
          console.log('\n✅ 找到 AdminCapability 对象:');
          console.log(`   ID: ${change.objectId}`);
          console.log(`   类型: ${change.objectType}`);
        } else {
          console.log(`\n📄 对象: ${change.objectId}`);
          console.log(`   类型: ${change.objectType}`);
        }
      }
    }

    return createdObjects;
  } catch (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  }
}

/**
 * 查找特定类型的对象
 */
export async function findObjectsByType(ownerAddress: string, objectType: string) {
  try {
    console.log(`🔍 查询类型为 ${objectType} 的对象...`);
    
    const objects = await suiClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: objectType,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (objects.data.length === 0) {
      console.log('❌ 未找到对象');
      return [];
    }

    console.log(`\n✅ 找到 ${objects.data.length} 个对象:`);
    for (const obj of objects.data) {
      console.log(`   ID: ${obj.data?.objectId}`);
      console.log(`   类型: ${obj.data?.type}`);
    }

    return objects.data;
  } catch (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  }
}

/**
 * 主函数 - 查找所有需要的对象
 */
export async function findAllContractObjects() {
  console.log('🚀 开始查找合约对象...\n');
  console.log('Package ID:', CONTRACTS.PACKAGE_ID);
  console.log('Deploy TX:', CONTRACTS.DEPLOY_TX);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    // 通过部署交易查找
    const objects = await findObjectsByTransaction(CONTRACTS.DEPLOY_TX);
    
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('✅ 查询完成！');
    console.log('\n📝 请将找到的对象 ID 复制到以下文件中:');
    console.log('   frontend/src/lib/contractObjects.ts');
    console.log('\n示例:');
    console.log('   CONFIG_ID: "0x..."');
    console.log('   STATE_ID: "0x..."');
    console.log('   ADMIN_CAP_ID: "0x..."');

    return objects;
  } catch (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (typeof window !== 'undefined' && (window as any).__RUN_FIND_OBJECTS__) {
  findAllContractObjects().catch(console.error);
}



