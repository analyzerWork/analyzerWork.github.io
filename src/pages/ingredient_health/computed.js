const HEALTH_RULES = [
  { label: "控糖/无糖", keywords: ["0乳糖", "0蔗糖", "0糖", "0卡糖"] },
  {
    label: "清洁标签",
    keywords: ["0植脂末", "0氢化", "非氢化", "0脂肪", "0脂", "0酒精"],
  },
  { label: "高蛋白", keywords: ["高蛋白", "浓醇牛乳", "源牧甄奶"] },
  {
    label: "优质奶源",
    keywords: [
      "有机",
      "A2",
      "娟姗",
      "水牛乳",
      "生牛乳",
      "鲜牛乳",
      "厚乳",
      "厚奶",
      "丝绒",
    ],
  },
  { label: "超级食物", keywords: ["羽衣甘蓝", "奇亚籽", "大麦若叶", "不老莓"] },
  { label: "益生菌/活菌", keywords: ["益生菌", "活菌", "B420"] },
  {
    label: "真材实料",
    keywords: [
      "NFC",
      "HPP",
      "鲜果",
      "鲜榨",
      "冷冻果肉",
      "冷萃",
      "SOE",
      "精品咖啡",
    ],
  },
  {
    label: "植物基",
    keywords: ["燕麦奶", "OATLY", "Oatly", "豆乳", "米乳", "椰乳", "生椰"],
  },
];

const HEALTH_RULES_LIST =  HEALTH_RULES.map(({label})=> label); 

//  2. 黑榜：风险减分属性
const RISK_RULES = [
  {
    label: "高糖/隐形糖",
    keywords: [
      "风味糖浆",
      "糖浆",
      "果葡糖浆",
      "白砂糖",
      "蔗糖",
      "山楂酱",
      "花酱",
      "玫瑰酱",
    ],
  },
  // # 注意：植脂末需要在逻辑中排除“0植脂末”的情况
  {
    label: "反式脂肪酸风险",
    keywords: ["植脂末", "氢化", "奶精", "植脂末标准基底乳"],
  },
  {
    label: "高热量/低营养",
    keywords: [
      "爆珠",
      "波波",
      "脆啵啵",
      "晶球",
      "寒天",
      "Q弹冻",
      "QQ冻",
      "芋圆",
      "Q果",
      "分子爆珠",
    ],
  },
  {
    label: "过度加工/添加剂",
    keywords: [
      "香精",
      "色素",
      "防腐剂",
      "浓浆",
      "风味饮料",
      "固体饮料",
      "调味糖浆",
    ],
  },
];

const RISK_RULES_LIST = RISK_RULES.map(({label})=> label); 


//# 3. 敏感/警示榜：特定人群限制属性
const WARNING_RULES = [
  //# 注意：酒精需要在逻辑中排除“0酒精”的情况
  {
    label: "含酒精/特定人群慎用",
    keywords: ["酒", "啤酒", "RIO", "威士忌", "朗姆", "伏特加", "白兰地"],
  },
];

/**
 * 接收产品对象数组，返回带有原料标签分析的结果
 * @param {Object[]} productDataArray - 包含产品信息的对象数组
 * @returns {Array} 包含产品基础信息及原料标签分析的对象数组
 */
function generateIngredientTags(productDataArray) {
  return productDataArray.map((product) => {
    // 提取原料字符串，并兼容处理顿号、逗号等分隔符
    const rawIngredientsStr = product["原料构成"] || "";
    const ingredients = rawIngredientsStr
      .split(/[、,，;；]/)
      .map((item) => item.trim())
      .filter((item) => item);

    // 遍历该产品的每一个原料，并计算标签
    const analyzedIngredients = ingredients.map((ingredient) => {
      const tags = [];
      const ingLower = ingredient.toLowerCase();

      // --- 1. 匹配红榜 ---
      for (const rule of HEALTH_RULES) {
        if (
          rule.keywords.some((keyword) =>
            ingLower.includes(keyword.toLowerCase())
          )
        ) {
          tags.push(rule.label);
        }
      }

      // --- 2. 匹配黑榜并应用排除逻辑 ---
      for (const rule of RISK_RULES) {
        const hasKeyword = rule.keywords.some((keyword) =>
          ingLower.includes(keyword.toLowerCase())
        );
        if (rule.label === "反式脂肪酸风险") {
          if (hasKeyword && !ingLower.includes("0植脂末")) {
            tags.push(rule.label);
          }
        } else {
          if (hasKeyword) {
            tags.push(rule.label);
          }
        }
      }

      // // --- 3. 匹配警示榜并应用排除逻辑 ---
      // for (const rule of WARNING_RULES) {
      //   const hasKeyword = rule.keywords.some(keyword => ingLower.includes(keyword.toLowerCase()));
      //   if (rule.label === '含酒精/特定人群慎用') {
      //     if (hasKeyword && !ingLower.includes('0酒精')) {
      //       tags.push(rule.label);
      //     }
      //   } else {
      //     if (hasKeyword) {
      //       tags.push(rule.label);
      //     }
      //   }
      // }

      return {
        原料名称: ingredient,
        属性标签: tags.length > 0 ? tags.join(" | ") : "无",
      };
    });

    // 返回保留了原产品所有信息，并新增 `原料分析结果` 的对象
    return {
      ...product, // 展开原有的月份、品牌、产品名称等所有字段
      原料分析结果: analyzedIngredients,
    };
  });
}

/**
 * 核心判断工具：输入单个原料，返回命中的红黑榜标签数组
 */
function checkIngredientTags(ingredient) {
  const tags = [];
  const ingLower = ingredient.toLowerCase();

  // 匹配红榜
  for (const rule of HEALTH_RULES) {
    if (
      rule.keywords.some((keyword) => ingLower.includes(keyword.toLowerCase()))
    ) {
      tags.push(rule.label);
    }
  }

  // 匹配黑榜并应用排除逻辑
  for (const rule of RISK_RULES) {
    const hasKeyword = rule.keywords.some((keyword) =>
      ingLower.includes(keyword.toLowerCase())
    );
    if (rule.label === "反式脂肪酸风险") {
      // 特殊排除逻辑：含有植脂末关键词，但不能包含“0植脂末”
      if (hasKeyword && !ingLower.includes("0植脂末")) {
        tags.push(rule.label);
      }
    } else {
      if (hasKeyword) {
        tags.push(rule.label);
      }
    }
  }
  return tags;
}

/**
 * 按 Label 维度分别统计红黑榜命中次数
 * @param {Array} productDataArray - 包含产品信息的原始数组
 * @returns {Object} 包含每个 label 具体命中次数的统计结果
 */
function countIngredientTagsByLabel(productDataArray) {
  // 1. 初始化统计对象，将所有红黑榜标签的初始计数设为 0
  const stats = {
    health: {},
    risk: {},
  };

  // 提前将规则中的 label 提取出来作为统计的初始键
  HEALTH_RULES.forEach((rule) => (stats.health[rule.label] = 0));
  RISK_RULES.forEach((rule) => (stats.risk[rule.label] = 0));

  // 2. 遍历产品数据
  productDataArray.forEach((product) => {
    // 拆分原料（兼容顿号、逗号、分号等分隔符）
    const rawIngredientsStr = product["原料构成"] || "";
    const ingredients = rawIngredientsStr
      .split(/[、,，;；]/)
      .map((item) => item.trim())
      .filter((item) => item);

    // 3. 遍历原料并调用核心判断工具
    ingredients.forEach((ingredient) => {
      const tags = checkIngredientTags(ingredient);

      // 4. 命中哪个标签，就给对应标签的计数器 +1
      tags.forEach((tag) => {
        if (stats.health.hasOwnProperty(tag)) {
          stats.health[tag]++;
        }
        if (stats.risk.hasOwnProperty(tag)) {
          stats.risk[tag]++;
        }
      });
    });
  });

  return stats;
}

/**
 * 计算每月原料构成中命中 Health 和 Risk 标签的累计次数
 * @param {Array} rawData - 后端返回的原始对象数组
 * @param {Array} healthRules - HEALTH_RULES 规则数组
 * @param {Array} riskRules - RISK_RULES 规则数组
 * @returns {Array} 返回处理后的月份统计数据
 */
function calculateMonthlyTagCounts(rawData, healthRules, riskRules) {
  if (!Array.isArray(rawData)) return [];

  // 按月份分组并统计
  const monthMap = {};

  rawData.forEach((item) => {
    const month = item["月份"];
    if (!month) return;

    // 初始化当前月份的计数器
    if (!monthMap[month]) {
      monthMap[month] = { healthCount: 0, riskCount: 0 };
    }

    // 将“原料构成”字符串拆分为数组，清洗空格
    const ingredientsStr = item["原料构成"] || "";
    const ingredients = ingredientsStr
      .split("、")
      .map((s) => s.trim())
      .filter(Boolean);

    // 1. 处理 Health 规则
    healthRules.forEach((rule) => {
      // 只要该产品包含该 rule 下的任意一个 keywords，就算命中该 label
      const isHit = ingredients.some((ing) =>
        rule.keywords.some((kw) => ing.includes(kw))
      );
      if (isHit) monthMap[month].healthCount++;
    });

    // 2. 处理 Risk 规则
    riskRules.forEach((rule) => {
      // 特殊拦截逻辑：如果是“反式脂肪酸风险”，必须排除掉包含“0植脂末”或“非氢化”的健康原料
      if (rule.label === "反式脂肪酸风险") {
        const hasRiskKeyword = ingredients.some((ing) =>
          rule.keywords.some((kw) => ing.includes(kw))
        );
        // 只有命中了风险词，且没有命中对应的安全词时，才计入风险
        const hasSafeKeyword = ingredients.some((ing) =>
          ["0植脂末", "非氢化"].some((safeKw) => ing.includes(safeKw))
        );

        if (hasRiskKeyword && !hasSafeKeyword) {
          monthMap[month].riskCount++;
        }
      } else {
        // 其他常规风险规则
        const isHit = ingredients.some((ing) =>
          rule.keywords.some((kw) => ing.includes(kw))
        );
        if (isHit) monthMap[month].riskCount++;
      }
    });
  });

  // 转换为 ECharts 友好的数组格式，并按月份排序
  return Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({
      month,
      ...counts,
    }));
}



