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
/**
 * 检查原料构成并返回命中的所有健康与风险标签
 * @param {string} ingredient - 产品的原料构成字符串
 * @returns {Array<string>} 命中的标签列表
 */
function checkIngredientTags(ingredient) {
  // 1. 防空处理，确保传入的是字符串
  if (!ingredient || typeof ingredient !== "string") return [];

  const tags = [];
  // ⚠️ 注意：这里不再强制 toLowerCase()。
  // 因为 JavaScript 的正则默认是区分大小写的，如果强制转小写，
  // 会导致像 /(?<!0)植脂末/ 这种依赖特定字符结构的正则失效或行为异常。
  // 建议在定义 RULES 时，对需要忽略大小写的词直接加上 'i' 标志，如 /oatly/i

  // 2. 统一匹配红榜 (HEALTH_RULES)
  for (const rule of HEALTH_RULES) {
    const isMatched = rule.keywords.some((keyword) => {
      if (keyword instanceof RegExp) {
        return keyword.test(ingredient);
      } else if (typeof keyword === "string") {
        return ingredient.includes(keyword);
      }
      return false;
    });

    if (isMatched) {
      tags.push(rule.label);
    }
  }

  // 3. 统一匹配黑榜 (RISK_RULES)
  // 💡 优化说明：之前的 "0植脂末" 特殊排除逻辑已被移除。
  // 因为在最新的 RISK_RULES 中，我们已经使用了 /(?<!0)植脂末/
  // 这样的负向断言正则，JS引擎会在底层自动完成精准过滤，无需业务代码再做二次判断。
  for (const rule of RISK_RULES) {
    const isMatched = rule.keywords.some((keyword) => {
      if (keyword instanceof RegExp) {
        return keyword.test(ingredient);
      } else if (typeof keyword === "string") {
        return ingredient.includes(keyword);
      }
      return false;
    });

    if (isMatched) {
      tags.push(rule.label);
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
 * 计算每个月份下命中健康标签和风险标签的产品数量
 * @param {Array} rawData - 原始产品数据数组
 * @param {Array} healthRules - 健康加分规则库 (HEALTH_RULES)
 * @param {Array} riskRules - 风险减分规则库 (RISK_RULES)
 * @returns {Array<Object>} ECharts 友好的按月统计结果
 */
function calculateMonthlyTagCounts(rawData, healthRules, riskRules) {
  if (!Array.isArray(rawData)) return [];

  const monthMap = {};

  rawData.forEach((item) => {
    const month = item["月份"];
    if (!month) return;

    // 初始化当前月份的计数器
    if (!monthMap[month]) {
      monthMap[month] = { healthCount: 0, riskCount: 0 };
    }

    // 💡 核心修改：将“原料构成”字符串按顿号拆分，清洗空格并过滤空值
    const ingredientsStr = item["原料构成"] || "";
    const ingredients = ingredientsStr
      .split("、")
      .map((s) => s.trim())
      .filter(Boolean);

    /**
     * 统一的匹配器：针对【单个成分】进行正则或子串匹配
     */
    const checkMatch = (keywords) => {
      // 只要该产品的任意一个成分命中了 keywords 中的任意一个词，即算命中
      return ingredients.some((ing) => 
        keywords.some((kw) => {
          if (kw instanceof RegExp) {
            return kw.test(ing);
          } else if (typeof kw === 'string') {
            return ing.includes(kw);
          }
          return false;
        })
      );
    };

    // 1. 处理 Health 规则 (红榜)
    healthRules.forEach((rule) => {
      if (checkMatch(rule.keywords)) {
        monthMap[month].healthCount++;
      }
    });

    // 2. 处理 Risk 规则 (黑榜)
    riskRules.forEach((rule) => {
      if (checkMatch(rule.keywords)) {
        monthMap[month].riskCount++;
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
