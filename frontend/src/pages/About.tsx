import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
              关于 DeFi-AI 信用哨兵
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-5 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">我们的使命</h3>
                  <p className="text-gray-300 mb-4">
                    通过AI技术与区块链的融合，打破传统DeFi借贷的超额抵押壁垒，为用户提供更高效、更公平的金融服务。
                  </p>
                  <p className="text-gray-300">
                    让信用成为链上资产，让每一位用户的良好行为都能获得相应的价值回报。
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="md:col-span-3"
            >
              <img 
                src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=DeFi+AI+Credit+Sentinel+concept+illustration+with+blockchain+and+AI+elements&sign=8a78afe6b857d2caedd5e1d76fa596b3" 
                alt="DeFi-AI信用哨兵概念图" 
                className="rounded-xl shadow-2xl shadow-blue-600/20 w-full h-auto"
              />
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">核心技术与创新</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-brain text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI信用评估模型</h3>
                <p className="text-gray-400">
                  多维度链上行为分析，综合评估用户交易历史、资产流动性、合约交互行为等数据，生成精准信用评分。
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-shield text-indigo-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">NFT信用凭证</h3>
                <p className="text-gray-400">
                  将信用评分结果以NFT形式上链，实现信用可视化与跨平台验证，为用户提供可流转、可验证的信用资产。
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fa-solid fa-link text-purple-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-3">跨协议集成</h3>
                <p className="text-gray-400">
                  与主流DeFi协议无缝集成，通过智能合约实现信用评分与借贷权限的自动绑定，提供个性化抵押率方案。
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">解决的关键问题</h2>
            
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">打破超额抵押壁垒</h3>
                  <p className="text-gray-300 mb-3">
                    当前主流 DeFi 借贷协议（Aave、Compound）普遍要求 <span className="text-red-400 font-semibold">133-154%</span> 的超额抵押率，严重制约了资金使用效率。
                  </p>
                  <p className="text-gray-300 mb-4">
                    <span className="text-blue-400 font-semibold">DeFi-AI 信用哨兵</span>通过 AI 信用评估，为优质用户提供差异化的<span className="text-green-400 font-semibold">超额部分抵押优惠</span>，最高可享受 <span className="text-green-400 font-bold text-lg">80% 优惠</span>！
                  </p>
                  
                  {/* 信用等级优惠表 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-3 border border-green-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-semibold text-sm">AAA 信用大师</span>
                        <span className="text-xs bg-green-500/20 px-2 py-1 rounded">Tier 4</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">80% 优惠</div>
                      <div className="text-xs text-gray-400 mt-1">超额部分仅需 20% 抵押</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-3 border border-blue-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-semibold text-sm">AA 信用勇士</span>
                        <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">Tier 3</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">60% 优惠</div>
                      <div className="text-xs text-gray-400 mt-1">超额部分仅需 40% 抵押</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-3 border border-purple-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-semibold text-sm">A 信用骑士</span>
                        <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">Tier 2</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">40% 优惠</div>
                      <div className="text-xs text-gray-400 mt-1">超额部分仅需 60% 抵押</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 rounded-lg p-3 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-semibold text-sm">BBB 信用卫士</span>
                        <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded">Tier 1</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-400">标准抵押</div>
                      <div className="text-xs text-gray-400 mt-1">与传统 DeFi 相同</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                    <div className="flex items-start">
                      <i className="fa-solid fa-lightbulb text-blue-400 text-lg mr-3 mt-1"></i>
                      <div className="text-sm text-gray-300">
                        <span className="font-semibold text-blue-400">计算示例：</span>
                        AAA 用户借贷 $10,000，基础抵押 $10,000 + 超额部分 $3,330 × 20% = <span className="text-green-400 font-semibold">总计仅需 $10,666</span>（传统 DeFi 需要 $13,300）
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20"></div>
                  <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <div className="w-full h-64 flex flex-col justify-center">
                      {/* 图表标题 */}
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-200 mb-2">借 $10,000 需要多少抵押？</h4>
                        <p className="text-sm text-gray-400">超额抵押率对比（主流协议 vs DeFi-AI AAA 用户）</p>
                      </div>
                      
                      {/* 对比图表 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {/* Aave */}
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-center mb-2">
                            <div className="text-blue-400 font-semibold text-sm mb-1">Aave V3</div>
                            <div className="text-xs text-gray-500">LTV 75%</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-700 rounded-lg h-20 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-red-500/80 to-red-600/80"></div>
                              <div className="relative z-10 text-center">
                                <div className="text-xl font-bold text-white">$13,333</div>
                                <div className="text-xs text-red-100">133% 抵押率</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compound */}
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-center mb-2">
                            <div className="text-purple-400 font-semibold text-sm mb-1">Compound</div>
                            <div className="text-xs text-gray-500">LTV 70%</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-700 rounded-lg h-20 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-orange-600/80"></div>
                              <div className="relative z-10 text-center">
                                <div className="text-xl font-bold text-white">$14,286</div>
                                <div className="text-xs text-orange-100">143% 抵押率</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* DeFi-AI */}
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-green-600">
                          <div className="text-center mb-2">
                            <div className="text-green-400 font-semibold text-sm mb-1">DeFi-AI</div>
                            <div className="text-xs text-gray-500">信用 AAA</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-full bg-gray-700 rounded-lg h-20 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-green-500/80 to-green-600/80"></div>
                              <div className="relative z-10 text-center">
                                <div className="text-xl font-bold text-white">$10,666</div>
                                <div className="text-xs text-green-100">107% 抵押率</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 优势说明 */}
                      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 border border-green-700/50">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <div className="text-green-400 font-semibold mb-1">💰 资金节省</div>
                            <div className="text-gray-300">相比 Aave 节省：<span className="text-green-400 font-bold">$2,667</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-semibold mb-1">📈 效率提升</div>
                            <div className="text-gray-300">资金效率提升：<span className="text-blue-400 font-bold">+25%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}