const CURRENT_YEAR = 2026;

const CURRENT_MONTH = 4;

const MONTH_LIST = Array.from({ length: 12 }, (_, index) => 12 - index);

const FIRST_HALF = "春夏(当年3月至8月)";

const FIRST_HALF_VALUE = "firstHalf";

const SECOND_HALF = "秋冬(当年9月至次年2月)";

const SECOND_HALF_VALUE = "secondHalf";

const YoY_VALUE = "yoy";

const MoM_VALUE = "mom";

const YoY_COMPARE = [{ value: YoY_VALUE, text: "去年同期(同比)" }];

const MoM_COMPARE = [{ value: MoM_VALUE, text: "上月(环比)" }];

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

const TEA_CLASSIFICATION_LIST = ["果味", "茶底", "花香", "乳基底"];

const COFFEE_CLASSIFICATION_LIST = [
  "果味",
  "茶底",
  "花香",
  "乳基底",
  "可可坚果",
  "谷物草本",
  "烘焙",
];

const ALL_CLASSIFICATION_LIST = [
  ...new Set([...TEA_CLASSIFICATION_LIST, ...COFFEE_CLASSIFICATION_LIST]),
];

const EMPTY_TEXT = "(无)";

const EMPTY_ITEM = {
  text: EMPTY_TEXT,
  value: EMPTY_VALUE,
};

const getOptions = (options) =>
  options.map((v) => ({
    text: v,
    value: v,
  }));

const PRODUCT_MAP = new Map([
  ["茶饮", [...getOptions(TEA_PRODUCT_LIST), EMPTY_ITEM]],
  ["咖啡", [...getOptions(COFFEE_PRODUCT_LIST), EMPTY_ITEM]],
  [EMPTY_VALUE, [...getOptions(ALL_CATEGORY_PRODUCT_LIST), EMPTY_ITEM]],
]);
const CLASSIFICATION_MAP = new Map([
  ["茶饮", getOptions(TEA_CLASSIFICATION_LIST)],
  ["咖啡", getOptions(COFFEE_CLASSIFICATION_LIST)],
  [EMPTY_VALUE, getOptions(ALL_CLASSIFICATION_LIST)],
]);

const isEmptyFilterValue = (value) =>
  value === undefined || value === EMPTY_VALUE;

class IngredientGrow extends CustomResizeObserver {
  data = [];
  bigProductTypeOptions = [
    { text: "茶饮", value: "茶饮" },
    { text: "咖啡", value: "咖啡" },
    { text: EMPTY_TEXT, value: EMPTY_VALUE },
  ];

  computedData = {
    currentYear: CURRENT_YEAR,
    yearList: [],
    dateList: [],
    selectedDate: "",
    selectedCompared: "",
    comparedList: [],
    startDateIndex: 0,
    endDateIndex: 0,
    comparedStartDateIndex: 0,
    comparedEndDateIndex: 0,

    filter: {
      bigProductTypeValue: "茶饮",
      productType: PRODUCT_MAP.get("茶饮")[0].value,
      ingredientClassification: CLASSIFICATION_MAP.get("茶饮")[0].value,
    },
  };

  element = {
    $yearSelect: document.querySelector("#yearSelect"),
    $dateSelect: document.querySelector("#dateSelect"),
    $comparedSelect: document.querySelector("#comparedSelect"),
    $bigProductTypeSelect: document.querySelector("#bigProductTypeSelect"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $ingredientTypeSelect: document.querySelector("#ingredientTypeSelect"),
    $summary: document.querySelector("#summary"),
    $pageLoading: document.querySelector("#pageLoading"),
  };
  constructor(initData) {
    super();
    this.init(initData);
    this.setup();
    this.bind();
  }

  get = (...keys) =>
    keys.reduce(
      (prev, key) => ({
        ...prev,
        [key]: this.computedData[key],
      }),
      {}
    );

  set = (data) => {
    this.computedData = {
      ...this.computedData,
      ...data,
    };
  };

  bind = () => {
    const instance = this;
    this.element.$yearSelect.addEventListener("change", function () {
      instance.yearChangeHandler(this.value);
    });

    this.element.$dateSelect.addEventListener("change", function () {
      instance.dateChangeHandler(this.value);
    });

    this.element.$comparedSelect.addEventListener("change", function () {
      instance.comparedChangeHandler(this.value);
    });

    this.element.$bigProductTypeSelect.addEventListener(
      "change",
      this.bigProductTypeSelectChangeHandler
    );

    this.element.$productTypeSelect.addEventListener(
      "change",
      this.productTypeSelectChangeHandler
    );

    this.element.$ingredientTypeSelect.addEventListener(
      "change",
      this.ingredientTypeSelectChangeHandler
    );
  };

  hasFirstHalf(year) {
    return year < CURRENT_YEAR || (year === CURRENT_YEAR && CURRENT_MONTH >= 8);
  }

  hasSecondHalf(year) {
    return (
      year < CURRENT_YEAR - 1 ||
      (year === CURRENT_YEAR - 1 && CURRENT_MONTH >= 2)
    );
  }

  computeDateList = (year) => {
    return []
      .concat(
        this.hasSecondHalf(year)
          ? [{ value: SECOND_HALF_VALUE, text: SECOND_HALF }]
          : []
      )
      .concat(
        this.hasFirstHalf(year)
          ? [{ value: FIRST_HALF_VALUE, text: FIRST_HALF }]
          : []
      )
      .concat(
        (year === CURRENT_YEAR
          ? MONTH_LIST.filter((month) => month <= CURRENT_MONTH)
          : MONTH_LIST
        ).map((item) => ({
          value: `${item}`.padStart(2, 0),
          text: `${item}月`,
        }))
      );
  };

  isHalfYear(date) {
    return date === FIRST_HALF_VALUE || date === SECOND_HALF_VALUE;
  }

  computeComparedList = (date) => {
    return this.isHalfYear(date)
      ? YoY_COMPARE
      : YoY_COMPARE.concat(MoM_COMPARE);
  };

  computeDataRangeIndex = (date) => {
    const { currentYear } = this.get("currentYear");
    let startDateIndex;
    let endDateIndex;
    let comparedStartDateIndex;
    let comparedEndDateIndex;
    if (date === SECOND_HALF_VALUE) {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${currentYear}-09`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear + 1}-02`
      );
      comparedStartDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${currentYear - 1}-09`
      );
      comparedEndDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear}-02`
      );
    } else if (date === FIRST_HALF_VALUE) {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${currentYear}-03`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear}-08`
      );
      comparedStartDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${currentYear - 1}-03`
      );
      comparedEndDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear - 1}-08`
      );
    } else {
      startDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${currentYear}-${date}`
      );
      endDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear}-${date}`
      );

      const comparedYear = date === "01" ? currentYear - 1 : currentYear;

      const comparedMonth = date === "01" ? "12" : `${date - 1}`.padStart(2, 0);

      comparedStartDateIndex = this.data.findIndex(
        (d) => d["月份"] === `${comparedYear}-${comparedMonth}`
      );
      comparedEndDateIndex = this.data.findLastIndex(
        (d) => d["月份"] === `${currentYear}-${comparedMonth}`
      );
    }

    return {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    };
  };

  computeRangeData = () => {
    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      filter,
    } = this.get(
      "startDateIndex",
      "endDateIndex",
      "comparedStartDateIndex",
      "comparedEndDateIndex",
      "filter"
    );

    const { bigProductTypeValue, productType, ingredientClassification } =
      filter;

    const currentDataByDateRange = this.data.slice(
      startDateIndex,
      endDateIndex
    );

    const currentComparedByDateRange = this.data.slice(
      comparedStartDateIndex,
      comparedEndDateIndex
    );

    const currentRangeData = computeCurrentDataRangeV2({
      data: currentDataByDateRange,
      bigProductTypeValue,
      productType,
      ingredientClassification,
    });

    const currentComparedRangeData = computeCurrentDataRangeV2({
      data: currentComparedByDateRange,
      bigProductTypeValue,
      productType,
      ingredientClassification,
    });

    return {
      currentRangeData,
      currentComparedRangeData,
    };
  };

  init = (initData) => {
    this.data = initData;
    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const yearRange = [...new Set(dateRange.map((date) => date.split("-")[0]))]
      .slice(1)
      .toReversed();

    const currentYear = yearRange[0];

    const dateList = this.computeDateList(Number(currentYear));

    const selectedDate = dateList[0].value;

    const comparedList = this.computeComparedList(selectedDate);

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    } = this.computeDataRangeIndex(selectedDate);

    this.set({
      currentYear,
      yearList: yearRange,
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      dateList,
      selectedDate,
      comparedList,
      selectedCompared: comparedList[0].value,
    });

    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
    this.renderHeader();

    this.renderSummary();

    this.computeIngredientGrowth();
  }

  renderHeader = () => {
    this.renderYearSelect();
    this.renderDateSelect();
    this.renderComparedSelect();
    this.renderBigProductType();
    this.renderProductType();
    this.renderIngredientClassification();
  };

  renderYearSelect = () => {
    const { yearList, currentYear } = this.get("currentYear", "yearList");
    if (yearList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(yearList);
      this.element.$yearSelect.innerHTML = null;
      this.element.$yearSelect.appendChild(menuFragment);
      this.element.$yearSelect.value = currentYear;
    }
  };

  renderDateSelect = () => {
    const { dateList, selectedDate } = this.get("selectedDate", "dateList");
    if (dateList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(dateList, true);
      this.element.$dateSelect.innerHTML = null;
      this.element.$dateSelect.appendChild(menuFragment);
      this.element.$dateSelect.value = selectedDate;
    }
  };

  renderComparedSelect = () => {
    const { comparedList, selectedCompared } = this.get(
      "selectedCompared",
      "comparedList"
    );
    const menuFragment = computedMenuOptionsFragment(comparedList, true);
    this.element.$comparedSelect.innerHTML = null;
    this.element.$comparedSelect.appendChild(menuFragment);
    this.element.$comparedSelect.value = selectedCompared;
  };

  renderBigProductType = () => {
    const {
      filter: { bigProductTypeValue },
    } = this.get("filter");
    if (this.bigProductTypeOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(
        this.bigProductTypeOptions,
        true
      );
      this.element.$bigProductTypeSelect.innerHTML = null;
      this.element.$bigProductTypeSelect.appendChild(menuFragment);
      this.element.$bigProductTypeSelect.value = bigProductTypeValue;
    }
  };

  renderProductType = () => {
    const {
      filter: { bigProductTypeValue },
    } = this.get("filter");

    const productOptions = PRODUCT_MAP.get(bigProductTypeValue ?? "") || [];

    if (productOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(productOptions, true);
      this.element.$productTypeSelect.innerHTML = null;
      this.element.$productTypeSelect.appendChild(menuFragment);
      this.element.$productTypeSelect.value = productOptions[0].value;
    }
  };

  renderIngredientClassification = () => {
    const {
      filter: { bigProductTypeValue },
    } = this.get("filter");

    const classificationOptions =
      CLASSIFICATION_MAP.get(bigProductTypeValue ?? "") || [];

    if (classificationOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(
        classificationOptions,
        true
      );
      this.element.$ingredientTypeSelect.innerHTML = null;
      this.element.$ingredientTypeSelect.appendChild(menuFragment);
      this.element.$ingredientTypeSelect.value = classificationOptions[0].value;
    }
  };

  renderSummary = () => {
    const { currentYear, selectedDate, selectedCompared, filter } = this.get(
      "currentYear",
      "selectedDate",
      "selectedCompared",
      "filter"
    );
    const { bigProductTypeValue, productType, ingredientClassification } =
      filter;

    let prompt = `${currentYear} 年`;

    if (selectedDate === SECOND_HALF_VALUE) {
      prompt += "秋冬(季节)";
    } else if (selectedDate === FIRST_HALF_VALUE) {
      prompt += "春夏(季节)";
    } else {
      prompt += ` ${Number(selectedDate)} 月`;
    }

    if (!isEmptyFilterValue(bigProductTypeValue)) {
      prompt += bigProductTypeValue === "茶饮" ? "茶饮新品中," : "咖啡中,";
    }

    if (!isEmptyFilterValue(productType)) {
      prompt += `${productType}分类下,`;
    }

    let compareDateStr = "相对";
    if (selectedCompared === YoY_VALUE) {
      compareDateStr += `去年同期(同比)`;
    } else {
      // 月环比
      const yearStr = selectedDate === "01" ? currentYear - 1 : currentYear;

      const monthStr = selectedDate === "01" ? "12" : selectedDate - 1;

      compareDateStr += ` ${yearStr} 年  ${monthStr} 月(环比)`;
    }

    prompt += compareDateStr;

    prompt += `使用量增长最快的${ingredientClassification}(成分) :`;

    this.element.$summary.innerHTML = prompt;
  };

  yearChangeHandler(value) {
    const { selectedDate } = this.get("selectedDate");

    const dateList = this.computeDateList(Number(value));

    const dateValueList = dateList.map((date) => date.value);

    const currentSelectedDate = dateValueList.includes(selectedDate)
      ? selectedDate
      : dateList[0].value;

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    } = this.computeDataRangeIndex(currentSelectedDate);

    this.set({
      dateList,
      currentYear: value,
      selectedDate: currentSelectedDate,
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    });

    // 重新渲染
    this.renderDateSelect();
    this.renderSummary();
    this.computeIngredientGrowth();
  }

  dateChangeHandler(value) {
    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    } = this.computeDataRangeIndex(value);

    const comparedList = this.computeComparedList(value);

    // 对比项的值直接取第一个即可，要么不变，要么只有一个
    const currentComparedDate = comparedList[0].value;

    this.set({
      comparedList,
      selectedDate: value,
      selectedCompared: currentComparedDate,
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    });

    // 重新渲染
    this.renderComparedSelect();
    this.renderSummary();
    this.computeIngredientGrowth();
  }

  comparedChangeHandler(value) {
    this.set({
      selectedCompared: value,
    });
    this.renderSummary();
    this.computeIngredientGrowth();
  }

  // 产品大类选择
  bigProductTypeSelectChangeHandler = (e) => {
    const currentBigProductType = e.target.value;
    this.set({
      filter: {
        bigProductTypeValue: currentBigProductType,
        productType: PRODUCT_MAP.get(currentBigProductType)[0].value,
        ingredientClassification: CLASSIFICATION_MAP.get(
          currentBigProductType
        )[0].value,
      },
    });

    this.renderProductType();

    this.renderIngredientClassification();

    this.renderSummary();

    this.computeIngredientGrowth();

    // this.updateData();
  };

  productTypeSelectChangeHandler = (e) => {
    const { filter } = this.get("filter");
    this.set({
      filter: {
        ...filter,
        productType: e.target.value,
      },
    });

    this.renderSummary();

    this.computeIngredientGrowth();
  };

  ingredientTypeSelectChangeHandler = (e) => {
    const { filter } = this.get("filter");

    this.set({
      filter: {
        ...filter,
        ingredientClassification: e.target.value,
      },
    });
    this.renderSummary();

    this.computeIngredientGrowth();
  };

  computeIngredientList(
    currentRangeData,
    bigProductTypeValue,
    ingredientClassification
  ) {
    const { resortFirstClassificationIngredient, firstIngredientCountMap } =
      computedRelatedFirstClassificationData(
        currentRangeData,
        bigProductTypeValue
      );

    const currentData = resortFirstClassificationIngredient.find(
      (item) => item.classification === ingredientClassification
    );

    if (currentData !== undefined) {
      const ingredientList = currentData.ingredientList;
      const ingredientItemList = [];

      for (const ingredient of ingredientList) {
        const count = firstIngredientCountMap.get(ingredient) || 0;
        ingredientItemList.push({
          name: ingredient,
          count: count,
        });
      }

      return ingredientItemList;
    } else {
      console.error("no data");
    }
  }

  computeIngredientGrowth() {
    const {
      filter: { bigProductTypeValue, ingredientClassification },
    } = this.get("bigProductTypeValue", "filter");
    const { currentRangeData, currentComparedRangeData } =
      this.computeRangeData();

    const data = this.computeIngredientList(
      currentRangeData,
      bigProductTypeValue,
      ingredientClassification
    );

    const comparedData = this.computeIngredientList(
      currentComparedRangeData,
      bigProductTypeValue,
      ingredientClassification
    );

    const comparedDataMap = new Map();
    for (const item of comparedData) {
      comparedDataMap.set(item.name, item.count);
    }

    // 存储正常增长率结果
    const normalGrowthRates = [];
    // 存储新成分结果
    const newIngredients = [];

    // 遍历数组data（新值）
    for (const item of data) {
      const name = item.name;
      const newCount = item.count; // 新值

      // 检查comparedData中是否存在相同的成分（旧值）
      if (!comparedDataMap.has(name)) {
        continue; // 如果comparedData中不存在该成分，则跳过
      }

      const oldCount = comparedDataMap.get(name); // 旧值

      if (oldCount === 0 && newCount !== 0) {
        // 旧值为0但新值不为0，表示新出现的成分
        newIngredients.push({
          name: name,
          oldCount: oldCount,
          newCount: newCount,
          growthRate: "N/A(新成分)",
        });
      } else if (oldCount !== 0) {
        // 正常情况：计算增长率 (新值 - 旧值) / 旧值 * 100%
        const growthRate = ((newCount - oldCount) / oldCount) * 100;

        if (growthRate > 0) {
          normalGrowthRates.push({
            name: name,
            oldCount: oldCount,
            newCount: newCount,
            growthRate: growthRate.toFixed(2),
          });
        }
      }
      // 如果oldCount为0且newCount为0，则跳过
    }

    // 对正常增长率按从大到小排序
    normalGrowthRates.sort((a, b) => b.growthRate - a.growthRate);

    // 合并结果：先返回正常增长率，最后是新成分
    const result = [...normalGrowthRates, ...newIngredients];

    console.log(result);
  }
}
