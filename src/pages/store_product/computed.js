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
  
 
  
