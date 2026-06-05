const CURRENT_YEAR = 2026;

const CURRENT_MONTH = 4;

const MONTH_LIST = Array.from({ length: 12 }, (_, index) => 12 - index);

const FIRST_HALF = "春夏(当年3月至8月)";

const FIRST_HALF_VALUE = "firstHalf";

const SECOND_HALF = "秋冬(当年9月至次年2月)";

const FIRST_SHORT_HALF = "春夏";

const SECOND_SHORT_HALF = "秋冬";

const SECOND_HALF_VALUE = "secondHalf";

const YoY_VALUE = "yoy";

const MoM_VALUE = "mom";

const YoY_COMPARE = [{ value: YoY_VALUE, text: "去年同期(同比)" }];

const MoM_COMPARE = [{ value: MoM_VALUE, text: "上月(环比)" }];

const classificationPriorityMap = new Map([
  ["果味", 6],
  ["茶底", 5],
  ["花香", 4],
  ["其他", 3],
  ["乳基底", 2],
  ["小料", 1],
]);

const TEA_CLASSIFICATION_LIST = [
  "果味",
  "茶底",
  "花香",
  "其他",
  "乳基底",
  "小料",
];

const COFFEE_CLASSIFICATION_LIST = [
  "丸子/圆子类小料",
  "乳基底",
  "其他",
  "冰淇淋",
  "冰球",
  "冻冻/布丁/麻薯类小料",
  "可可坚果",
  "咖啡",
  "奶盖/奶油顶类",
  "果味",
  "气泡水类",
  "水果干/粒",
  "烘焙",
  "珍珠/爆珠类/啵啵类",
  "糖",
  "糖类",
  "花香",
  "茶底",
  "谷物草本",
  "酒",
  "雪芭",
];

const TEA_PRODUCT_LIST = [
  "水果茶",
  "奶茶(多料为主)",
  "奶盖茶",
  "果奶",
  "轻乳茶",
  "冰淇淋",
  "酸奶",
  "奶茶(多料奶茶)",
];

const COFFEE_PRODUCT_LIST = [
  "拿铁",
  "美式",
  "精品/单品咖啡",
  "Dirty",
  "玛奇朵",
  "创意咖啡",
  "澳白",
  "浓缩",
  "馥芮白",
  "冰滴/冷萃",
  "阿芙佳朵",
  "摩卡",
  "低因咖啡",
  "阿芙加朵",
  "低卡咖啡",
  "精品咖啡",
];

const ALL_CATEGORY_PRODUCT_LIST = [
  ...new Set([...TEA_PRODUCT_LIST, ...COFFEE_PRODUCT_LIST]),
];

const ALL_CLASSIFICATION_LIST = [
  ...new Set([...TEA_CLASSIFICATION_LIST, ...COFFEE_CLASSIFICATION_LIST]),
];

const SELECT_ALL = "全部";

const SELECT_ALL_VALUE = "ALL";

const EMPTY_TEXT = "(无)";

const EMPTY_VALUE = "--";

const EMPTY_ITEM = {
  text: EMPTY_TEXT,
  value: EMPTY_VALUE,
};

const ALL_ITEM = {
  text: SELECT_ALL,
  value: SELECT_ALL_VALUE,
};

const BIG_PRODUCT_OPTIONS = [
  { text: "茶饮", value: "茶饮" },
  { text: "咖啡", value: "咖啡" },
];

const COFFICE_LIST = [
  "果味",
  "茶底",
  "花香",
  "乳基底",
  "谷物草本",
  "烘焙",
  "可可坚果",
];

const getOptions = (options) =>
  options.map((v) => ({
    text: v,
    value: v,
  }));

const PRODUCT_MAP = new Map([
  ["茶饮", [...getOptions(TEA_PRODUCT_LIST), ALL_ITEM]],
  ["咖啡", [...getOptions(COFFEE_PRODUCT_LIST), ALL_ITEM]],
  [SELECT_ALL_VALUE, [...getOptions(ALL_CATEGORY_PRODUCT_LIST), ALL_ITEM]],
]);
const CLASSIFICATION_MAP = new Map([
  ["茶饮", getOptions(TEA_CLASSIFICATION_LIST)],
  ["咖啡", getOptions(COFFEE_CLASSIFICATION_LIST)],
  [SELECT_ALL_VALUE, getOptions(ALL_CLASSIFICATION_LIST)],
]);

const isEmptyFilterValue = (value) =>
  value === undefined || value === SELECT_ALL_VALUE;

const HEALTH_RULES = [
  {
    label: "控糖/无糖",
    keywords: [
      "0乳糖",
      "0蔗糖",
      "0糖",
      "0卡糖",
      /.*代糖.*/,
      "赤藓糖醇",
      "罗汉果甜苷",
      "甜菊糖",
    ],
  },
  {
    label: "清洁标签",
    keywords: [
      /.*0植脂末.*/,
      /.*非氢化.*/,
      "0脂肪",
      "0脂",
      "0酒精",
      /.*0反式.*/,
    ],
  },
  {
    label: "高蛋白",
    keywords: ["高蛋白", /.*浓醇牛乳.*/, /.*源牧甄奶.*/, /.*优质蛋白.*/],
  },
  {
    label: "优质奶源",
    keywords: [
      "有机",
      "A2",
      "娟姗",
      "水牛乳",
      /.*生牛乳.*/,
      /.*鲜牛乳.*/,
      /.*厚乳.*/,
      /.*厚奶.*/,
      /.*丝绒.*/,
      /.*冰博克.*/,
      "提纯乳",
    ],
  },
  {
    label: "超级食物",
    keywords: ["羽衣甘蓝", "奇亚籽", "大麦若叶", "不老莓", "巴西莓", "沙棘"],
  },
  {
    label: "益生菌/活菌",
    keywords: [/.*益生菌.*/, /.*活菌.*/, "B420", /.*乳酸菌.*/],
  },
  {
    label: "真材实料",
    keywords: [
      "NFC",
      "HPP",
      /.*鲜[榨果].*/,
      /.*冷冻果肉.*/,
      /.*冷萃.*/,
      "SOE",
      /.*精品咖啡.*/,
      /.*原叶茶.*/,
      /.*纯茶.*/,
    ],
  },
  {
    label: "植物基",
    keywords: [
      /.*燕麦奶.*/,
      "OATLY",
      "Oatly",
      /.*豆乳.*/,
      /.*米乳.*/,
      /.*椰乳.*/,
      /.*生椰.*/,
      /.*杏仁奶.*/,
    ],
  },
];

const HEALTH_RULES_LIST = HEALTH_RULES.map(({ label }) => label);

//  2. 黑榜：风险减分属性
const RISK_RULES = [
  {
    label: "高糖/隐形糖",
    keywords: [
      /.*风味糖浆.*/,
      /.*调味糖浆.*/,
      /.*果葡糖浆.*/,
      /.*白砂糖.*/,
      /.*蔗糖.*/,
      /.*花酱.*/,
      /.*玫瑰酱.*/,
      /.*山楂酱.*/,
      /.*果酱.*/,
      /.*果泥.*/,
      "蜂蜜",
      "焦糖浆",
    ],
  },
  {
    label: "反式脂肪酸风险",
    // ⚠️ 核心优化：使用 (?<!0) 排除掉带有“0”前缀的健康宣称，防止误伤
    keywords: [/(?<!0)植脂末/, /(?<!非)氢化/, /.*奶精.*/, /.*标准基底乳.*/],
  },
  {
    label: "高热量/低营养",
    keywords: [
      /.*爆珠.*/,
      /.*波波.*/,
      /.*脆啵啵.*/,
      /.*晶球.*/,
      /.*寒天.*/,
      /.*芋圆.*/,
      /.*麻薯.*/,
      /.*珍珠.*/,
      /.*布丁.*/,
      /.*果冻.*/,
      /.*奶油顶.*/,
      /.*芝士奶盖.*/,
    ],
  },
  {
    label: "过度加工/添加剂",
    keywords: [
      /.*香精.*/,
      /.*色素.*/,
      /.*防腐剂.*/,
      /.*浓浆.*/,
      /.*风味饮料.*/,
      /.*固体饮料.*/,
      /.*浓缩液.*/,
      /.*糖浆.*/,
    ],
  },
];

const RISK_RULES_LIST = RISK_RULES.map(({ label }) => label);

//# 3. 敏感/警示榜：特定人群限制属性
const WARNING_RULES = [
  //# 注意：酒精需要在逻辑中排除“0酒精”的情况
  {
    label: "含酒精/特定人群慎用",
    keywords: ["酒", "啤酒", "RIO", "威士忌", "朗姆", "伏特加", "白兰地"],
  },
];

/**
 * 消费者体验标签库 - 口感质地与咀嚼感 (Mouthfeel & Chew)
 */
const TEXTURE_RULES = [
  {
    label: "绵密顺滑",
    keywords: ["丝绒", "冰博克", "生酪", "水牛乳", "娟姗", "厚椰乳"],
  },
  {
    label: "Q弹脆爽",
    keywords: [
      /.*脆啵啵.*/,
      /.*脆波波.*/,
      /.*晶球.*/,
      "寒天",
      "仙草",
      "爱玉冻",
      "蒟蒻",
      "西米",
      "椰果",
    ],
  },
  {
    label: "软糯扎实",
    keywords: [
      "麻薯",
      "芋圆",
      "血糯米",
      "红豆沙",
      "绿豆沙",
      /.*糯叽叽.*/,
      "布丁",
      "奶冻",
    ],
  },
  {
    label: "丰富层次",
    keywords: [
      /.*奶盖.*/,
      /.*咸酪.*/,
      "奥利奥",
      "布蕾",
      /.*奶油顶.*/,
      /.*雪顶.*/,
    ],
  },
];


const TEXTURE_RULES_LIST = TEXTURE_RULES.map(({ label }) => label);


/**
 * 消费者体验标签库 - 风味记忆点与香气 (Flavor & Aroma)
 */
const FLAVOR_RULES = [
  {
    label: "高级茶香",
    keywords: [
      "鸭屎香",
      "茉莉花茶",
      "茉莉绿茶",
      "乌龙茶",
      "铁观音",
      "锡兰红茶",
      "阿萨姆红茶",
      "伯爵红茶",
      "白毫茉莉",
      "玉露",
      "抹茶",
      "焙茶",
      "炭焙乌龙",
      "凤凰单丛",
      "高山乌龙",
      "龙井",
      "碧螺春",
    ],
  },
  {
    label: "标志性果香",
    keywords: [
      "香水柠檬",
      "阳光玫瑰",
      "巨峰葡萄",
      "杨枝甘露",
      /.*多肉.*/,
      "水蜜桃",
      "百香果",
      "草莓",
      "芒果",
      "桑葚",
      "杨梅",
      "山楂",
      "油柑",
      "刺梨",
      "血橙",
      "青柚",
    ],
  },
  {
    label: "浓郁烘焙",
    keywords: [
      /.*厚椰乳.*/,
      "太妃榛果",
      /.*焦糖玛奇朵.*/,
      "海盐焦糖",
      "烤杏仁",
      "可可",
      "巧克力",
      "黑巧",
      "肉桂",
      "黄油",
      "坚果酱",
    ],
  },
  {
    label: "猎奇特色",
    keywords: [
      "羽衣甘蓝",
      "大麦若叶",
      "鱼腥草",
      "折耳根",
      "刺梨",
      "沙棘",
      "苦瓜",
      "薄荷",
      "话梅",
      "陈皮",
      "海盐",
      "咸蛋黄",
      "奇亚籽",
      "仙人掌果",
    ],
  },
];

const FLAVOR_RULES_LIST = FLAVOR_RULES.map(({ label }) => label);


/**
 * 消费者体验标签库 - 身体负担与清爽度 (Body Load & Refreshment)
 */
const BURDEN_RULES = [
  {
    label: "清爽解腻",
    keywords: [
      "0卡糖",
      "0蔗糖",
      "0糖",
      "0脂",
      "0植脂末",
      "非氢化",
      /.*气泡水.*/,
      /.*苏打水.*/,
      /.*轻乳.*/,
      /.*冷萃.*/,
      "低卡",
      "低脂",
      "轻盈",
      "解渴",
    ],
  },
  {
    label: "浓郁满足",
    keywords: [
      /.*厚乳.*/,
      /.*芝士奶盖.*/,
      "奥利奥",
      /.*坚果酱.*/,
      "燕麦奶",
      "生酪",
      /.*奶油顶.*/,
      "全脂",
      "高蛋白",
      "代餐",
      "饱腹",
    ],
  },
  {
    label: "温润暖胃",
    keywords: [
      "黑糖",
      "红糖",
      "姜汁",
      "肉桂",
      /.*热红酒.*/,
      /.*烤奶.*/,
      "米酿",
      "醪糟",
      "红枣",
      "桂圆",
      "冬日限定",
    ],
  },
];

const BURDEN_RULES_LIST = BURDEN_RULES.map(({ label }) => label);


/**
 * 消费者体验标签库 - 温度耐受与状态 (Temperature Stability)
 * ⚠️ 此维度最适合使用正则，因为原始文档中通常包含大量类似“冷冻XXX果肉浆”、“速冻XXX泥”的变体
 */
const STABILITY_RULES = [
  {
    label: "冰爽抗化",
    keywords: [
      // 核心词直接匹配
      "冰博克",
      /.*气泡.*/,
      /.*冰沙.*/,
      // 使用正则捕获所有冷冻/速冻相关的果肉和果浆
      /.*(冷冻|速冻).*果肉.*/,
      /.*(冷冻|速冻).*果浆.*/,
      /.*(冷冻|速冻).*果泥.*/,
      /.*(冷冻|速冻).*生椰乳.*/,
      /.*(冷冻|速冻).*椰子.*/,
      /.*(冷冻|速冻).*芋泥.*/,
    ],
  },
  {
    label: "热饮醇香",
    keywords: [
      "鲜牛乳",
      "娟姗奶",
      "燕麦奶",
      /.*烤奶.*/,
      "焦糖",
      "肉桂",
      "姜茶",
      "红糖",
      "黑糖",
      "米酿",
      /.*热红酒.*/,
      "醇香",
      "蒸汽朋克",
      "热巧",
      "热可可",
    ],
  },
  {
    label: "状态稳定",
    keywords: [
      "基底乳",
      "植脂末",
      "果酱",
      "浓浆",
      "糖浆",
      /.*风味饮料浓浆.*/,
      /.*固体饮料.*/,
      "冻干",
      "脆波波",
      "晶球",
      "寒天",
      "仙草",
      "挂壁",
    ],
  },
];

const STABILITY_RULES_LIST = STABILITY_RULES.map(({ label }) => label);

