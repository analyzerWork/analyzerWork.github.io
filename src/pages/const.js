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
