class IngredientGrow extends CustomResizeObserver {
  data = [];
  bigProductTypeOptions = [
    { text: "茶饮", value: "茶饮" },
    { text: "咖啡", value: "咖啡" },
    { text: SELECT_ALL, value: SELECT_ALL_VALUE },
  ];

  computedData = {
    currentYear: CURRENT_YEAR,
    yearList: [],
    dateList: [],
    selectedDate: "",
    selectedCompared: "",
    comparedYear: CURRENT_YEAR,
    comparedDate: "",
    comparedList: [],
    startDateIndex: 0,
    endDateIndex: 0,
    comparedStartDateIndex: 0,
    comparedEndDateIndex: 0,
    currentTdTitle: "",
    comparedTdTitle: "",
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
    $ingredientGrowSection: document.querySelector("#ingredientGrowSection"),
    $currentTdTitle: document.querySelector("#currentTdTitle"),
    $comparedTdTitle: document.querySelector("#comparedTdTitle"),
    $summary: document.querySelector("#summary"),
    $ingredientGrowTbody: document.querySelector("#ingredientGrowTbody"),
    $emptySection: document.querySelector("#emptySection"),
    $ingredientGrowLoading: document.querySelector("#ingredientGrowLoading"),
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



  computeDataRangeIndex = (date) => {
    const { currentYear, selectedCompared } = this.get(
      "currentYear",
      "selectedCompared"
    );

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      comparedDateStr,
      currentDateStr,
    } = computeDataRangeIndexV2(this.data, {
      date,
      currentYear,
      selectedCompared,
    });

    return {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle:currentDateStr,
      comparedTdTitle:comparedDateStr,
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

  

    const currentRangeData = computeCurrentDataRangeV2({
      data: this.data,
      startDateIndex,
      endDateIndex,
      bigProductTypeValue,
      productType,
      ingredientClassification,
    });

    const currentComparedRangeData = computeCurrentDataRangeV2({
      data: this.data,
      bigProductTypeValue,
      startDateIndex:comparedStartDateIndex,
      endDateIndex:comparedEndDateIndex,
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

    const dateList = computeDateList(Number(currentYear));

    const selectedDate = dateList[0].value;

    const comparedList = computeComparedList(selectedDate);

    this.set({
      currentYear,
      yearList: yearRange,
      selectedCompared: comparedList[0].value,
      dateList,
      selectedDate,
      comparedList,
    });

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
    } = this.computeDataRangeIndex(selectedDate);

    this.set({
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,

      currentTdTitle,
      comparedTdTitle,
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

    const dateList = computeDateList(Number(value));

    const dateValueList = dateList.map((date) => date.value);

    const currentSelectedDate = dateValueList.includes(selectedDate)
      ? selectedDate
      : dateList[0].value;

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
    } = this.computeDataRangeIndex(currentSelectedDate);

    this.set({
      currentYear: value,
      dateList,
      selectedDate: currentSelectedDate,
      startDateIndex,
      endDateIndex,
      currentTdTitle,
      comparedTdTitle,
      comparedStartDateIndex,
      comparedEndDateIndex,
    });

    // 重新渲染
    this.renderDateSelect();
    this.renderSummary();
    this.computeIngredientGrowth();
  }

  dateChangeHandler(value) {
    const comparedList = this.computeComparedList(value);

    // 对比项的值直接取第一个即可，要么不变，要么只有一个
    const currentComparedDate = comparedList[0].value;

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
    } = this.computeDataRangeIndex(value);

    this.set({
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
      comparedList,
      selectedDate: value,
      selectedCompared: currentComparedDate,
    });

    // 重新渲染
    this.renderComparedSelect();
    this.renderSummary();
    this.computeIngredientGrowth();
  }

  comparedChangeHandler(value) {
    const { selectedDate } = this.get("selectedDate");

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
    } = this.computeDataRangeIndex(selectedDate);

    this.set({
      selectedCompared: value,
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle,
      comparedTdTitle,
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

  computeIngredientGrowth() {
    const { currentRangeData, currentComparedRangeData } =
      this.computeRangeData();

    const data = getProcessedIngredientsStats(currentRangeData);

    const comparedData = getProcessedIngredientsStats(currentComparedRangeData);

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
        // DEBUG: console.log(growthRate)
        if (growthRate > 0) {
          normalGrowthRates.push({
            name: name,
            newCount: newCount,
            oldCount: oldCount,
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

    this.renderGrowthTable(result);
  }

  renderGrowthTable = (data) => {
    this.element.$ingredientGrowLoading.classList.remove("hide");

    this.element.$ingredientGrowTbody.innerHTML = null;

    window.setTimeout(() => {
      const { currentTdTitle, comparedTdTitle } = this.get(
        "comparedTdTitle",
        "currentTdTitle"
      );
      this.element.$currentTdTitle.innerHTML = currentTdTitle;
      this.element.$comparedTdTitle.innerHTML = comparedTdTitle;

      if (data.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.appendChild(this.element.$emptySection.content.cloneNode(true));
        td.colSpan = 4;
        tr.appendChild(td);
        this.element.$ingredientGrowTbody.appendChild(tr);
      } else {
        const tbodyFragment = document.createDocumentFragment();

        data.forEach((item) => {
          const tr = document.createElement("tr");
          Object.entries(item).forEach(([_, value]) => {
            const td = document.createElement("td");
            td.innerHTML = value;
            tr.appendChild(td);
          });
          tbodyFragment.appendChild(tr);
        });
        this.element.$ingredientGrowTbody.appendChild(tbodyFragment);
      }
      this.element.$ingredientGrowLoading.classList.add("hide");
    }, 1000);
  };
}
