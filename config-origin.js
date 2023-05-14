const CONFIG = {
  routes: [
    { pathname: "taste_matching", name: "口味创意搭配" },
    { pathname: "ingredient_tracking", name: "关键成分追踪" },
  ],
};

const VALUES = {
  nav: {
    defaultClass: "default-menu",
    activeClass: "active-menu",
  },
};

const INIT_PASSWORD = "ly2023!";

const ADMIN_GROUP = ["曹海涛", "董慧"];

const RESEARCH_GROUP = [
  "杜冰",
  "孙婉",
  "常静娟",
  "林珍妮",
  "谢玉洁",
  "梁喜旺",
  "郑旭",
];

const MARKETING_GROUP = [
  "李鹏",
  "宋乐燕",
  "陈茜曦",
  "李龙秀",
  "梁明珠",
  "王艳",
  "文小娟",
  "李墨岚",
  "谭咏琳",
  "王珊",
  "王琨",
];

const RD_GROUP = [
  "温红瑞",
  "侯文举",
  "张冲",
  "张奎",
  "李楠",
  "谷晓青",
  "蔡桂林",
  "李霄燕",
  "郭强",
  "李岩",
  "李凤英",
];

const DIRECTOR_GROUP = ["刘云俊", "李伟", "徐海军"];

const SALES_GROUP = [
  "徐玉朋",
  "包铁柱",
  "耿建成",
  "李东新",
  "张永龙",
  "韩正威",
  "朱祥",
  "敖宏伟",
  "董长河",
  "张报",
  "臧猛蛟",
  "郝轶",
];

const OTHER_GROUP = ["郑楠", "闫志强", "李春红"];

const CUSTOM_PASS_GROUP_MAP = new Map([
  ["曹海涛", ""],
  ["董慧", "donghui"],
]);

const ALL_USER = [
  ...ADMIN_GROUP,
  ...DIRECTOR_GROUP,
  ...RESEARCH_GROUP,
  ...MARKETING_GROUP,
  ...RD_GROUP,
  ...SALES_GROUP,
  ...OTHER_GROUP,
];

const USER_INFO = Object.freeze(
  ALL_USER.map((name) =>
    CUSTOM_PASS_GROUP_MAP.has(name)
      ? { name, password: CUSTOM_PASS_GROUP_MAP.get(name) }
      : { name, password: INIT_PASSWORD }
  )
);
