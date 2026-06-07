/**
 * 从原始数据中提取门店数排名前 N 的记录
 * @param {Array} rawData - 原始数据集
 * @param {string} countField - 代表门店数量的字段名 (如 'storeCount' 或 '门店数')
 * @param {number} topN - 需要提取的排名数量，默认为 20
 * @returns {Array} 过滤后的 Top N 数据数组
 */
function getTopStoresByCount(rawData, countField = '门店数', topN = 30) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];
  
    // 1. 按门店数降序排序，并做防空处理（防止非数字类型导致排序异常）
    const sortedData = [...rawData].sort((a, b) => {
      const countA = Number(a[countField]) || 0;
      const countB = Number(b[countField]) || 0;
      return countB - countA; 
    });
  
    // 2. 截取前 N 条数据
    return sortedData.slice(0, topN);
  }


  /**
 * 获取按某字段降序排列的前 N% 数据
 * @param {Array} rawData - 原始数据数组
 * @param {string} countField - 用于排序的字段名，默认为 '门店数'
 * @param {number} topPercent - 需要截取的比例 (0-100)，默认为 30 表示前 30%
 * @returns {Array} - 返回排序并截取后的新数组
 */
function getTopStoresByPercent(rawData, countField = '门店数', topPercent = 10) {
  // 1. 基础防御性校验
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  // 2. 将百分比限制在合理的 0~100 范围内，防止越界
  const safePercent = Math.max(0, Math.min(100, Number(topPercent) || 0));

  // 3. 按指定字段降序排序，并做防空处理（防止非数字类型导致排序异常）
  const sortedData = [...rawData].sort((a, b) => {
      const countA = Number(a[countField]) || 0;
      const countB = Number(b[countField]) || 0;
      return countB - countA;
  });

  // 4. 核心改动：根据总长度和百分比，动态计算需要截取的绝对数量
  // 使用 Math.ceil 向上取整，确保即使只有 1 条数据时，也能至少保留 1 条（避免 0 的情况）
  const actualCount = Math.ceil(sortedData.length * (safePercent / 100));

  // 5. 截取前 N% 的数据并返回
  return sortedData.slice(0, actualCount);
}

/**
 * 分析产品原料在各个消费者体验维度下的命中次数
 * @param {Array} productList - 产品数据列表
 * @param {Object} rulesMap - 包含所有规则的映射对象
 * @returns {Object} 统计结果
 */
function analyzeConsumerExperience(productList, rulesMap) {
    // 初始化统计结果对象
    const statistics = {};
    
    // 遍历所有的维度（如 TEXTURE_RULES, FLAVOR_RULES 等）
    for (const [ruleKey, rules] of Object.entries(rulesMap)) {
      statistics[ruleKey] = {};
      
      // 初始化该维度下所有 label 的计数为 0
      rules.forEach(rule => {
        statistics[ruleKey][rule.label] = 0;
      });
      
      // 遍历每一个产品
      productList.forEach(product => {
        // 获取原料构成字段，并做防空处理
        const ingredients = product['原料构成'] || '';
        
        // 检查当前产品的原料是否命中了该维度的某个标签
        rules.forEach(rule => {
          // 只要命中任意一个 keyword，就认为该产品属于此标签
          const isMatched = rule.keywords.some(keyword => {
            if (keyword instanceof RegExp) {
              return keyword.test(ingredients);
            } else if (typeof keyword === 'string') {
              return ingredients.includes(keyword);
            }
            return false;
          });
          
          if (isMatched) {
            statistics[ruleKey][rule.label]++;
          }
        });
      });
    }
    
    return statistics;
  }
  
 
  
