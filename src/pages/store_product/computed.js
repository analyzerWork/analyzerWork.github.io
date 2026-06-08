/**
 * 从原始数据中提取门店数排名前 N 的记录
 * @param {Array} rawData - 原始数据集
 * @param {string} countField - 代表门店数量的字段名 (如 'storeCount' 或 '门店数')
 * @param {number} topN - 需要提取的排名数量，默认为 20
 * @returns {Array} 过滤后的 Top N 数据数组
 */
function getTopStoresByCount(rawData, countField = "门店数", topN = 30) {
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
function getTopStoresByPercent(
  rawData,
  countField = "门店数",
  topPercent = 10
) {
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
 * 核心匹配逻辑（提取为独立函数）
 * @param {string} text - 待匹配的文本（如原料构成）
 * @param {object} rule - 规则对象（包含 keywords 和 regex 数组）
 * @returns {boolean} - 是否命中
 */
function matchRule(text, rule) {
  if (!text) return false;

  // 1. 优先检查 keywords (纯字符串精确匹配，效率极高)
  if (
    rule.keywords?.length > 0 &&
    rule.keywords.some((keyword) => text.includes(keyword))
  ) {
    return true;
  }

  // 2. 如果字符串没命中，再检查 regex (正则模糊匹配)
  if (rule.regex?.length > 0 && rule.regex.some((regex) => regex.test(text))) {
    return true;
  }

  return false;
}

/**
 * 消费者体验分析主函数
 * @param {Array} productList - 产品列表
 * @param {Object} rulesMap - 规则映射表（如 { texture: TEXTURE_RULES, flavor: FLAVOR_RULES }）
 * @returns {Object} - 统计结果
 */
function analyzeConsumerExperience(productList, rulesMap) {
  const statistics = {};

  for (const [ruleKey, rules] of Object.entries(rulesMap)) {
    statistics[ruleKey] = {};

    // 初始化该维度下所有 label 的计数为 0
    rules.forEach((rule) => {
      statistics[ruleKey][rule.label] = 0;
    });

    // 遍历每一个产品
    productList.forEach((product) => {
      const ingredients = product["原料构成"] || "";

      // 检查当前产品的原料是否命中了该维度的某个标签
      rules.forEach((rule) => {
        // 调用提取出的独立匹配函数
        if (matchRule(ingredients, rule)) {
          statistics[ruleKey][rule.label]++;
        }
      });
    });
  }

  return statistics;
}

/**
 * 将分散的规则数组与权重配置合并，生成标准的嵌套规则库
 * @param {Object} ruleCategories - 原始的规则大类集合 (如 { HEALTH_RULES: [...], TEXTURE_RULES: [...] })
 * @param {Object} weightConfig - 按分类组织的嵌套权重配置表
 */
function buildRulesDefinition(ruleCategories, weightConfig = {}) {
  const finalRules = {};

  Object.entries(ruleCategories).forEach(([categoryName, rulesArray]) => {
    if (!Array.isArray(rulesArray)) return;

    // 提取当前分类的名称（例如 'HEALTH_RULES' -> 'HEALTH'）
    const categoryKey = categoryName.replace("_RULES", "");
    // 获取该分类下的专属权重字典
    const currentCategoryWeights = weightConfig[categoryKey] || {};

    // 🌟 【核心改动】直接映射生成新数组，保留原有的分类结构
    finalRules[categoryKey] = rulesArray.map((rule) => ({
      label: rule.label,
      keywords: rule.keywords || [],
      regex: rule.regex || [],
      // 从对应分类的字典中精准取权重，如果未配置则兜底给 0.5
      weight:
        currentCategoryWeights[rule.label] !== undefined
          ? currentCategoryWeights[rule.label]
          : 0.5,
    }));
  });

  return finalRules;
}

/**
 * 目标消费者画像匹配引擎 (Persona Engine) - 高性能双步架构版
 */

// ================= 1. 规则库定义 (Rules Definition) =================
const RULES = buildRulesDefinition(ALL_RULES, WEIGHT_CONFIG);

const PERSONA_DIMENSIONS = [
  "极致自律的成分党",
  "悦己主义的口感控",
  "寻味打卡的茶咖极客",
  "朋克养生的轻食派",
  "节气仪式的温补族",
];

// ================= 2. 核心工具函数 (Utils) =================
const matchLabel = (ingredientStr, rule) => {
  const str = ingredientStr.toLowerCase();
  if (rule.keywords.some((kw) => str.includes(kw.toLowerCase()))) return true;
  if (rule.regex.some((re) => re.test(str))) return true;
  return false;
};

const extractTagsFromList = (ingredientList) => {
  const tags = new Set();
  for (const ingredient of ingredientList) {
    Object.values(RULES).forEach((categoryRules) => {
      categoryRules.forEach((rule) => {
        if (matchLabel(ingredient, rule)) tags.add(rule.label);
      });
    });
  }
  return Array.from(tags);
};

const getWeight = (tags, targetLabels, baseWeight) => {
  return targetLabels.some((label) => tags.includes(label)) ? baseWeight : 0;
};

// ================= 3. 第一步：宏观聚合分析 (仅在筛选条件改变时调用) =================
function aggregatePersonaStats(filteredData) {
  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    return { totalProducts: 0, dimensions: [], taggedProducts: [] };
  }

  const globalPersonaCount = {};
  const personaTagMap = {};

  // 【优化】初始化所有已知维度，并强制加入 '泛大众基础款' 以防降级时报错
  const ALL_PERSONAS = [...new Set([...PERSONA_DIMENSIONS, "泛大众基础款"])];
  ALL_PERSONAS.forEach((p) => {
    globalPersonaCount[p] = 0;
    personaTagMap[p] = {};
  });

  // 遍历每一款产品进行微观打标并缓存
  const taggedProducts = filteredData.map((product) => {
    // Step A: 解析原料并提取标签
    const rawIngredients = product["原料构成"] || "";
    const ingredientList = rawIngredients
      .split(/[、,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = extractTagsFromList(ingredientList);

    // Step B: 互斥检查
    let isExcludedFromCleanPurist = false;
    let isExcludedFromSeasonalRitualist = false;
    if (tags.includes("清爽解腻") && tags.includes("浓郁满足"))
      isExcludedFromCleanPurist = true;
    if (tags.includes("控糖/无糖") && tags.includes("软糯扎实"))
      isExcludedFromCleanPurist = true;
    if (tags.includes("清洁标签") && tags.includes("状态稳定"))
      isExcludedFromCleanPurist = true;
    if (tags.includes("温润暖胃") && tags.includes("冰爽抗化"))
      isExcludedFromSeasonalRitualist = true;

    // Step C: 基础加权打分
    const scores = {};
    const w1 =
      getWeight(tags, ["控糖/无糖", "清洁标签"], 1.0) +
      getWeight(tags, ["真材实料", "优质奶源"], 0.8) +
      getWeight(tags, ["清爽解腻"], 0.6) +
      getWeight(tags, ["植物基"], 0.5);
    scores["极致自律的成分党"] = isExcludedFromCleanPurist
      ? 0
      : Math.min(100, w1 * 25);

    const w2 =
      getWeight(tags, ["Q弹脆爽", "软糯扎实", "丰富层次"], 1.0) +
      getWeight(tags, ["浓郁烘焙"], 0.9) +
      getWeight(tags, ["浓郁满足"], 0.8) +
      getWeight(tags, ["绵密顺滑"], 0.7);
    scores["悦己主义的口感控"] = Math.min(100, w2 * 25);

    const w3 =
      getWeight(tags, ["高级茶香", "真材实料"], 1.0) +
      getWeight(tags, ["猎奇特色"], 0.9);
    scores["寻味打卡的茶咖极客"] = Math.min(100, w3 * 33);

    const w4 =
      getWeight(tags, ["超级食物", "益生菌/活菌"], 1.0) +
      getWeight(tags, ["清爽解腻"], 0.8) +
      getWeight(tags, ["Q弹脆爽"], 0.6);
    scores["朋克养生的轻食派"] = Math.min(100, w4 * 28);

    const w5 =
      getWeight(tags, ["温润暖胃", "热饮醇香"], 1.0) +
      getWeight(tags, ["猎奇特色"], 0.7);
    scores["节气仪式的温补族"] = isExcludedFromSeasonalRitualist
      ? 0
      : Math.min(100, w5 * 33);

    // Step D: 动态相对惩罚
    const hasHeavyTexture =
      tags.includes("丰富层次") || tags.includes("浓郁满足");

    if (hasHeavyTexture) {
      // 1. 防御【朋克养生的轻食派】：只要命中了该画像的任一核心标签，且有重口味冲突，即惩罚
      const isLightFoodCore =
        tags.includes("超级食物") ||
        tags.includes("益生菌/活菌") ||
        tags.includes("清爽解腻");
      if (isLightFoodCore && scores["朋克养生的轻食派"] > 0) {
        scores["朋克养生的轻食派"] *= 0.8;
      }

      // 2. 防御【寻味打卡的茶咖极客】：同理，命中茶底核心标签且有重口味冲突，即惩罚
      const isTeaGeekCore =
        tags.includes("高级茶香") || tags.includes("真材实料");
      if (isTeaGeekCore && scores["寻味打卡的茶咖极客"] > 0) {
        scores["寻味打卡的茶咖极客"] *= 0.8;
      }
    }
    // Step E: 确定该产品的主画像
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topScore = sortedScores[0]?.[1] || 0;
    const secondScore = sortedScores[1]?.[1] || 0;

    let finalPersona = "泛大众基础款";

    // 1. 绝对准入门槛（允许单点突破的特征被识别）
    if (topScore >= 20) {
      // 2. 双重置信度校验：
      // 绝对分差 >= 15（确保领先优势相当于半个核心标签）
      // 且次高分不能超过最高分的 80%（防止两个极高分数互相掩盖）
      const absoluteMargin = topScore - secondScore;
      const relativeRatio = secondScore / topScore;

      /**
       * 为什么是 15 分？
        我们来拆解一下您的基础加权公式（以 w4 = 28 为例）：
        命中 1 个权重为 1.0 的标签：得分 = 1.0×28=28
        命中 2 个权重为 1.0 的标签：得分 = 2.0×28=56
        命中 1 个 1.0 和 1 个 0.8 的标签：得分 = 1.8×28=50.4
        可以看出，在这个体系下，多命中一个核心标签的分差大约是 25~30 分。
        因此，设定 15 分的 Margin（安全边际），意味着：第一名的得分至少比第二名多出了“半个核心标签”的优势。
        这在业务上代表着该产品有压倒性的主打卖点，而不是靠多个次要卖点堆砌出来的分数
       */
      if (absoluteMargin >= 15 && relativeRatio <= 0.8) {
        finalPersona = sortedScores[0][0];
      } else {
        // 分数咬得太紧，或者缺乏断层优势，诚实归入泛大众
        finalPersona = "泛大众基础款";
      }
    }

    // 累计到宏观统计数据中
    globalPersonaCount[finalPersona]++;
    tags.forEach((tag) => {
      personaTagMap[finalPersona][tag] =
        (personaTagMap[finalPersona][tag] || 0) + 1;
    });

    // 返回带有打标结果的新对象快照，避免污染原始数据
    return { ...product, _finalPersona: finalPersona };
  });

  // 组装五个维度的宏观数据
  const totalProducts = taggedProducts.length;
  const dimensions = PERSONA_DIMENSIONS.map((name) => {
    const currentCount = globalPersonaCount[name] || 0; // 当前维度的总产品数

    const currentTopTags = Object.entries(personaTagMap[name] || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, tagCount]) => ({
        tag,
        count: tagCount,
        coverage: Number(((tagCount / currentCount) * 100).toFixed(1)), // 🌟 计算该标签在当前画像中的渗透率
      }));

    return {
      name,
      count: currentCount,
      percentage: Number(((currentCount / totalProducts) * 100).toFixed(1)),
      topTags: currentTopTags,
    };
  });

  return {
    totalProducts,
    dimensions,
    taggedProducts,
  };
}
// ================= 4. 第二步：微观明细提取 (用户点击交互时调用，极速响应) =================
function extractDetailProducts(taggedProducts, targetPersona) {
  if (!targetPersona || !Array.isArray(taggedProducts)) return [];

  // 极轻量级的 O(n) 内存过滤，无需任何复杂计算
  return taggedProducts
    .filter((p) => p._finalPersona === targetPersona)
    .map((item) => ({
      产品名称: item["产品名称"],
      品牌: item["品牌"],
      原料构成: item["原料构成"],
      覆盖门店数: item["门店数"],
    }));
}
