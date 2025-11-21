// Sui 网络和合约配置

export const SUI_NETWORK = 'testnet'; // 可选: 'mainnet', 'testnet', 'devnet'

// 合约信息
export const CONTRACTS = {
  // Package ID (部署的合约包地址)
  PACKAGE_ID: '0x760b3645aa204c466abe4122a258a96bfa68b8074bd410e83e47348158d39f63',
  
  // 模块名称
  MODULES: {
    CREDIT_SCORE_BADGE: 'credit_score_badge',
    LOCK: 'lock',
  },
  
  // Upgrade Capability ID
  UPGRADE_CAP_ID: '0x2567b729519257cbb6deff5fcb949dd1605810011ffb43b19e9068bdd6842aa5',
  
  // Transaction Digest
  DEPLOY_TX: 'ELNwCNtQa8QFAuQYaDDFKRDuGBTDVPNKgNZuvoWFxR57',
};

// 网络配置
export const NETWORK_CONFIG = {
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443',
    explorer: 'https://suiscan.xyz/mainnet',
  },
  testnet: {
    url: 'https://fullnode.testnet.sui.io:443',
    explorer: 'https://suiscan.xyz/testnet',
  },
  devnet: {
    url: 'https://fullnode.devnet.sui.io:443',
    explorer: 'https://suiscan.xyz/devnet',
  },
};

// 获取当前网络配置
export function getNetworkConfig() {
  return NETWORK_CONFIG[SUI_NETWORK];
}

// 获取浏览器链接
export function getExplorerUrl(type: 'address' | 'tx' | 'object', id: string) {
  const baseUrl = getNetworkConfig().explorer;
  return `${baseUrl}/${type}/${id}`;
}

// 合约函数名称
export const CONTRACT_FUNCTIONS = {
  CREDIT_SCORE_BADGE: {
    INITIALIZE: 'initialize',
    SET_TIER: 'set_tier',
    SET_SIGNER: 'set_signer',
    CLAIM_OR_UPGRADE: 'claim_or_upgrade',
    BURN: 'burn',
    GET_TIER: 'get_tier',
    LIST_TIER_IDS: 'list_tier_ids',
    TOKEN_URI: 'token_uri',
    CURRENT_TIER: 'current_tier',
    GET_TOKEN_DATA: 'get_token_data',
    TRANSFER_NFT: 'transfer_nft',
  },
  LOCK: {
    INITIALIZE: 'initialize',
    INITIALIZE_WITH_COINS: 'initialize_with_coins',
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
    WITHDRAW_AMOUNT: 'withdraw_amount',
    GET_UNLOCK_TIME: 'get_unlock_time',
    GET_OWNER: 'get_owner',
    GET_BALANCE: 'get_balance',
    IS_UNLOCKED: 'is_unlocked',
    UPDATE_UNLOCK_TIME: 'update_unlock_time',
  },
};



