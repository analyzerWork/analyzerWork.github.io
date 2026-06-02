const HEALTH_RULES = [
    {"label": "控糖/无糖", "keywords": ["0乳糖", "0蔗糖", "0糖", "0卡糖"]},
    {"label": "清洁标签", "keywords": ["0植脂末", "0氢化", "非氢化", "0脂肪", "0脂", "0酒精"]},
    {"label": "高蛋白", "keywords": ["高蛋白", "浓醇牛乳", "源牧甄奶"]},
    {"label": "优质奶源", "keywords": ["有机", "A2", "娟姗", "水牛乳", "生牛乳", "鲜牛乳", "厚乳", "厚奶", "丝绒"]},
    {"label": "超级食物", "keywords": ["羽衣甘蓝", "奇亚籽", "大麦若叶", "不老莓"]},
    {"label": "益生菌/活菌", "keywords": ["益生菌", "活菌", "B420"]},
    {"label": "真材实料", "keywords": ["NFC", "HPP", "鲜果", "鲜榨", "冷冻果肉", "冷萃", "SOE", "精品咖啡"]},
    {"label": "植物基", "keywords": ["燕麦奶", "OATLY", "Oatly", "豆乳", "米乳", "椰乳", "生椰"]}
]

//  2. 黑榜：风险减分属性
const RISK_RULES = [
    {"label": "高糖/隐形糖", "keywords": ["风味糖浆", "糖浆", "果葡糖浆", "白砂糖", "蔗糖", "山楂酱", "花酱", "玫瑰酱"]},
    // # 注意：植脂末需要在逻辑中排除“0植脂末”的情况
    {"label": "反式脂肪酸风险", "keywords": ["植脂末", "氢化", "奶精", "植脂末标准基底乳"]}, 
    {"label": "高热量/低营养", "keywords": ["爆珠", "波波", "脆啵啵", "晶球", "寒天", "Q弹冻", "QQ冻", "芋圆", "Q果", "分子爆珠"]},
    {"label": "过度加工/添加剂", "keywords": ["香精", "色素", "防腐剂", "浓浆", "风味饮料", "固体饮料", "调味糖浆"]}
]

 //# 3. 敏感/警示榜：特定人群限制属性
const WARNING_RULES = [
    //# 注意：酒精需要在逻辑中排除“0酒精”的情况
    {"label": "含酒精/特定人群慎用", "keywords": ["酒", "啤酒", "RIO", "威士忌", "朗姆", "伏特加", "白兰地"]}
]

/**
 * 接收产品对象数组，返回带有原料标签分析的结果
 * @param {Object[]} productDataArray - 包含产品信息的对象数组
 * @returns {Array} 包含产品基础信息及原料标签分析的对象数组
 */
function generateIngredientTags(productDataArray) {
    return productDataArray.map(product => {
      // 提取原料字符串，并兼容处理顿号、逗号等分隔符
      const rawIngredientsStr = product['原料构成'] || '';
      const ingredients = rawIngredientsStr.split(/[、,，;；]/).map(item => item.trim()).filter(item => item);
  
      // 遍历该产品的每一个原料，并计算标签
      const analyzedIngredients = ingredients.map(ingredient => {
        const tags = [];
        const ingLower = ingredient.toLowerCase();
  
        // --- 1. 匹配红榜 ---
        for (const rule of HEALTH_RULES) {
          if (rule.keywords.some(keyword => ingLower.includes(keyword.toLowerCase()))) {
            tags.push(rule.label);
          }
        }
  
        // --- 2. 匹配黑榜并应用排除逻辑 ---
        for (const rule of RISK_RULES) {
          const hasKeyword = rule.keywords.some(keyword => ingLower.includes(keyword.toLowerCase()));
          if (rule.label === '反式脂肪酸风险') {
            if (hasKeyword && !ingLower.includes('0植脂末')) {
              tags.push(rule.label);
            }
          } else {
            if (hasKeyword) {
              tags.push(rule.label);
            }
          }
        }
  
        // --- 3. 匹配警示榜并应用排除逻辑 ---
        for (const rule of WARNING_RULES) {
          const hasKeyword = rule.keywords.some(keyword => ingLower.includes(keyword.toLowerCase()));
          if (rule.label === '含酒精/特定人群慎用') {
            if (hasKeyword && !ingLower.includes('0酒精')) {
              tags.push(rule.label);
            }
          } else {
            if (hasKeyword) {
              tags.push(rule.label);
            }
          }
        }
  
        return {
          原料名称: ingredient,
          属性标签: tags.length > 0 ? tags.join(' | ') : '无'
        };
      });
  
      // 返回保留了原产品所有信息，并新增 `原料分析结果` 的对象
      return {
        ...product, // 展开原有的月份、品牌、产品名称等所有字段
        原料分析结果: analyzedIngredients
      };
    });
  }
  