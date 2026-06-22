const CURRENT_YEAR = 2026;

const CURRENT_MONTH = 5;

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

const STORE_COUNT_OPTIONS = [{text: SELECT_ALL,
  value: "100",}].concat([
  { text: "TOP 50%", value: "50" },
  { text: "TOP 30%", value: "30" },
  { text: "TOP 20%", value: "20" },
  { text: "TOP 10%", value: "10" },
]);

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
    keywords: ["0乳糖", "0蔗糖", "0糖", "0卡糖", "赤藓糖醇", "罗汉果甜苷", "甜菊糖"],
    regex: [/.*代糖.*/],
  },
  {
    label: "清洁标签",
    keywords: ["0脂肪", "0脂", "0酒精"],
    regex: [/.*0植脂末.*/, /.*非氢化.*/, /.*0反式.*/],
  },
  {
    label: "高蛋白",
    keywords: ["高蛋白"],
    regex: [/.*浓醇牛乳.*/, /.*源牧甄奶.*/, /.*优质蛋白.*/],
  },
  {
    label: "优质奶源",
    keywords: ["有机", "A2", "娟姗", "水牛乳", "提纯乳"],
    regex: [/.*生牛乳.*/, /.*鲜牛乳.*/, /.*厚乳.*/, /.*厚奶.*/, /.*丝绒.*/, /.*冰博克.*/],
  },
  {
    label: "超级食物",
    keywords: ["羽衣甘蓝", "奇亚籽", "大麦若叶", "不老莓", "巴西莓", "沙棘"],
    regex: [],
  },
  {
    label: "益生菌/活菌",
    keywords: ["B420"],
    regex: [/.*益生菌.*/, /.*活菌.*/, /.*乳酸菌.*/],
  },
  {
    label: "真材实料",
    keywords: ["NFC", "HPP", "SOE"],
    regex: [/.*鲜[榨果].*/, /.*冷冻果肉.*/, /.*冷萃.*/, /.*精品咖啡.*/, /.*原叶茶.*/, /.*纯茶.*/],
  },
  {
    label: "植物基",
    keywords: ["OATLY", "Oatly"],
    regex: [/.*燕麦奶.*/, /.*豆乳.*/, /.*米乳.*/, /.*椰乳.*/, /.*生椰.*/, /.*杏仁奶.*/],
  },
];

const RISK_RULES = [
  {
    label: "高糖/隐形糖",
    keywords: ["蜂蜜", "焦糖浆"],
    regex: [/.*风味糖浆.*/, /.*调味糖浆.*/, /.*果葡糖浆.*/, /.*白砂糖.*/, /.*蔗糖.*/, /.*花酱.*/, /.*玫瑰酱.*/, /.*山楂酱.*/, /.*果酱.*/, /.*果泥.*/],
  },
  {
    label: "反式脂肪酸风险",
    keywords: [],
    regex: [/(?<!0)植脂末/, /(?<!非)氢化/, /.*奶精.*/, /.*标准基底乳.*/],
  },
  {
    label: "高热量/低营养",
    keywords: [],
    regex: [/.*爆珠.*/, /.*波波.*/, /.*脆啵啵.*/, /.*晶球.*/, /.*寒天.*/, /.*芋圆.*/, /.*麻薯.*/, /.*珍珠.*/, /.*布丁.*/, /.*果冻.*/, /.*奶油顶.*/, /.*芝士奶盖.*/],
  },
  {
    label: "过度加工/添加剂",
    keywords: [],
    regex: [/.*香精.*/, /.*色素.*/, /.*防腐剂.*/, /.*浓浆.*/, /.*风味饮料.*/, /.*固体饮料.*/, /.*浓缩液.*/, /.*糖浆.*/],
  },
];

const TEXTURE_RULES = [
  {
    label: "绵密顺滑",
    keywords: ["丝绒", "冰博克", "生酪", "水牛乳", "娟姗", "厚椰乳","绵云","奶芙"],
    regex: [],
  },
  {
    label: "Q弹脆爽",
    keywords: ["寒天", "仙草", "爱玉冻", "蒟蒻", "西米", "椰果"],
    regex: [/.*脆啵啵.*/, /.*脆波波.*/, /.*晶球.*/],
  },
  {
    label: "软糯扎实",
    keywords: ["麻薯", "芋圆", "血糯米", "红豆沙", "绿豆沙", "布丁", "奶冻","双皮奶"],
    regex: [/.*糯叽叽.*/],
  },
  {
    label: "丰富层次",
    keywords: ["奥利奥", "布蕾"],
    regex: [/.*奶盖.*/, /.*咸酪.*/, /.*奶油顶.*/, /.*雪顶.*/],
  },
];

const FLAVOR_RULES = [
  {
    label: "高级茶香",
    keywords: [
      "鸭屎香", "茉莉花茶", "茉莉绿茶", "乌龙茶", "铁观音", "锡兰红茶", 
      "阿萨姆红茶", "伯爵红茶", "白毫茉莉", "玉露", "抹茶", "焙茶", 
      "炭焙乌龙", "凤凰单丛", "高山乌龙", "龙井", "碧螺春","绿妍"
    ],
    regex: [],
  },
  {
    label: "标志性果香",
    keywords: [
      "香水柠檬", "阳光玫瑰", "巨峰葡萄", "杨枝甘露", "水蜜桃", "百香果", 
      "草莓", "芒果", "桑葚", "杨梅", "山楂", "油柑", "刺梨", "血橙", "青柚"
    ],
    regex: [/.*多肉.*/],
  },
  {
    label: "浓郁烘焙",
    keywords: [
      "太妃", "海盐焦糖", "烤杏仁", "可可", "巧克力", "黑巧", 
      "肉桂", "黄油", "坚果酱"
    ],
    regex: [/.*厚椰乳.*/, /.*焦糖玛奇朵.*/],
  },
  {
    label: "猎奇特色",
    keywords: [
      "羽衣甘蓝", "大麦若叶", "鱼腥草", "折耳根", "刺梨", "沙棘", "苦瓜", 
      "薄荷", "话梅", "陈皮", "海盐", "咸蛋黄", "奇亚籽", "仙人掌果"
    ],
    regex: [],
  },
];

const BURDEN_RULES = [
  {
    label: "清爽解腻",
    keywords: [
      "0卡糖", "0蔗糖", "0糖", "0脂", "0植脂末","非氢化", "低卡", 
      "低脂", "轻盈", "解渴","轻乳"
    ],
    regex: [/.*气泡水.*/, /.*苏打水.*/, /.*轻乳.*/, /.*冷萃.*/],
  },
  {
    label: "浓郁满足",
    keywords: ["奥利奥", "生酪", "全脂", "高蛋白", "代餐", "饱腹"],
    regex: [/.*厚乳.*/, /.*芝士奶盖.*/, /.*坚果酱.*/, /.*燕麦奶.*/, /.*奶油顶.*/],
  },
  {
    label: "温润暖胃",
    keywords: ["黑糖", "红糖", "姜汁", "肉桂", "米酿", "醪糟", "红枣", "桂圆", "冬日限定"],
    regex: [/.*热红酒.*/, /.*烤奶.*/],
  },
];

const STABILITY_RULES = [
  {
    label: "冰爽抗化",
    keywords: ["冰博克"],
    regex: [
      /.*气泡.*/, /.*冰沙.*/, 
      /.*(冷冻|速冻).*果肉.*/, /.*(冷冻|速冻).*果浆.*/, 
      /.*(冷冻|速冻).*果泥.*/, /.*(冷冻|速冻).*生椰乳.*/, 
      /.*(冷冻|速冻).*椰子.*/, /.*(冷冻|速冻).*芋泥.*/
    ],
  },
  {
    label: "热饮醇香",
    keywords: ["鲜牛乳", "娟姗奶", "燕麦奶", "焦糖", "肉桂", "姜茶", "红糖", "黑糖", "米酿", "醇香", "蒸汽朋克", "热巧", "热可可"],
    regex: [/.*烤奶.*/, /.*热红酒.*/],
  },
  {
    label: "状态稳定",
    keywords: ["基底乳", "植脂末", "果酱", "浓浆", "糖浆", "冻干", "脆波波", "晶球", "寒天", "仙草", "挂壁"],
    regex: [/.*风味饮料浓浆.*/, /.*固体饮料.*/],
  },
];

const HEALTH_RULES_LIST = HEALTH_RULES.map(({ label }) => label);


const RISK_RULES_LIST = RISK_RULES.map(({ label }) => label);


const TEXTURE_RULES_LIST = TEXTURE_RULES.map(({ label }) => label);


const FLAVOR_RULES_LIST = FLAVOR_RULES.map(({ label }) => label);


const BURDEN_RULES_LIST = BURDEN_RULES.map(({ label }) => label);


const STABILITY_RULES_LIST = STABILITY_RULES.map(({ label }) => label);


const RULES_MAP = {
  health:HEALTH_RULES,
  texture: TEXTURE_RULES,
  flavor: FLAVOR_RULES,
  burden: BURDEN_RULES,
  stability: STABILITY_RULES
};


// 组装所有的规则大类
const ALL_RULES = { 
  HEALTH_RULES, 
  TEXTURE_RULES, 
  FLAVOR_RULES, 
  BURDEN_RULES, 
  STABILITY_RULES 
};


// 按照 RULES 的分类和顺序严格对齐，一目了然
const WEIGHT_CONFIG = {
  HEALTH: {
    "控糖/无糖": 1.0,
    "清洁标签": 1.0,
    "高蛋白": 0.8,       // 【新增】
    "优质奶源": 0.8,
    "超级食物": 1.0,
    "益生菌/活菌": 0.9,
    "真材实料": 0.8,
    "植物基": 0.5,
  },
  TEXTURE: {
    "绵密顺滑": 0.7,
    "Q弹脆爽": 1.0,
    "软糯扎实": 1.0,
    "丰富层次": 1.0,
  },
  FLAVOR: {
    "高级茶香": 1.0,
    "标志性果香": 0.6,
    "浓郁烘焙": 0.9,
    "猎奇特色": 0.9,
  },
  BURDEN: {
    "清爽解腻": 0.8,
    "浓郁满足": 0.8,
    "温润暖胃": 1.0,
  },
  STABILITY: {
    "冰爽抗化": 1.0,
    "热饮醇香": 1.0,
    "状态稳定": 0.3,      // 补充基础状态词的低权重
  }
};



