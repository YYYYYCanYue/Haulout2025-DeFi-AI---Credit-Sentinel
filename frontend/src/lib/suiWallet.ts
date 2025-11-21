// Sui 钱包连接工具
// 注意：@mysten/dapp-kit 使用 React hooks，不需要手动管理钱包列表

// 钱包连接状态类型
export interface WalletState {
  connected: boolean;
  address: string | null;
  wallet: any | null;
}

// 获取可用的 Sui 钱包列表
// 在新版本中，这个功能由 @mysten/dapp-kit 的 hooks 自动处理
export function getAvailableWallets() {
  // 返回空数组，实际的钱包管理由 dapp-kit 处理
  return [];
}

// 检查是否有可用的 Sui 钱包
export function hasSuiWallet(): boolean {
  // 在新版本中，由 dapp-kit 自动检测
  return true;
}

// 获取推荐的钱包（Sui Wallet 或第一个可用钱包）
export function getRecommendedWallet() {
  // 在新版本中，由 dapp-kit 的 WalletProvider 自动处理
  return null;
}

// 格式化钱包名称
export function formatWalletName(walletName: string): string {
  const nameMap: Record<string, string> = {
    'Sui Wallet': 'Sui Wallet',
    'Suiet': 'Suiet',
    'Ethos Wallet': 'Ethos',
    'Surf Wallet': 'Surf',
    'Glass Wallet': 'Glass',
    'Morphis Wallet': 'Morphis',
  };
  
  return nameMap[walletName] || walletName;
}

// 钱包图标映射
export function getWalletIcon(walletName: string): string {
  // 这里可以根据需要返回钱包图标
  // 暂时返回默认图标
  return '🔐';
}


