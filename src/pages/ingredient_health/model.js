const { setOptionConfig } = window.parent.echartsVariables;

class IngredientHealth extends CustomResizeObserver {
  data = [];
  bigProductTypeOptions = BIG_PRODUCT_OPTIONS;
  healthRadarInstance = null;
  riskRadarInstance = null;
  computedData = {
    bigProductTypeValue: "茶饮",
    brand: SELECT_ALL_VALUE,
    productType: SELECT_ALL_VALUE,
    brandOptions: [],
    currentRangeData: [],
    currentRangeExcludeBrandData: [],
    overview: {
      currentYear: CURRENT_YEAR,
      yearList: [],
      dateList: [],
      selectedDate: "",
    },
    trend: {
      startDate: 0,
      endDate: 0,
      healthTags: HEALTH_RULES_LIST,
      riskTags: RISK_RULES_LIST,
    },
  };

  element = {
    $bigProductTypeSelect: document.querySelector("#bigProductTypeSelect"),
    $brandSelect: document.querySelector("#brandSelect"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $ruleInfo: document.querySelector("#ruleInfo"),
    $tagRemindDialog: document.querySelector("#tagRemindDialog"),
    $trendDatePicker: document.querySelector("#trendDatePicker"),
    $yearSelect: document.querySelector("#yearSelect"),
    $dateSelect: document.querySelector("#dateSelect"),
    $healthRadar: document.querySelector("#healthRadar"),
    $riskRadar: document.querySelector("#riskRadar"),
    $radarRemindBtn: document.querySelector("#radarRemindBtn"),
    $healthPanel: document.querySelector("#healthTagPanel"),
    $riskPanel: document.querySelector("#riskTagPanel"),
    $healthOptionsWrapper: document.querySelector("#healthOptionsWrapper"),
    $riskOptionsWrapper: document.querySelector("#riskOptionsWrapper"),
    $healthInput: document.querySelector("#healthInput"),
    $riskInput: document.querySelector("#riskInput"),
    $healthTrend: document.querySelector("#healthTrend"),
    $contentWrapper: document.querySelector("#contentWrapper"),
    $radarRemindDialog: document.querySelector("#radarRemindDialog"),
    $emptySection: document.querySelector("#emptySection"),
    $pageLoading: document.querySelector("#pageLoading"),
  };
  constructor(initData) {
    super();
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;

    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];

    const { bigProductTypeValue } = this.get("bigProductTypeValue");
    const { brandOptions } = getBrandByBigProductType(
      this.data,
      bigProductTypeValue
    );
    this.set({
      brandOptions,
      brand: brandOptions.at(0).value,
    });

    this.initOverview(dateRange);
    this.initTagOptions();
    this.initTrend(dateRange);
    this.element.$healthInput.value = HEALTH_RULES_LIST.join(" 、");
    this.element.$riskInput.value = RISK_RULES_LIST.join(" 、");
    this.healthRadarInstance = window.parent.echarts.init(
      this.element.$healthRadar
    );
    this.riskRadarInstance = window.parent.echarts.init(
      this.element.$riskRadar
    );
    this.healthTrendInstance = window.parent.echarts.init(
      this.element.$healthTrend
    );
    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
    this.updateCurrentRangeData();
    this.renderHeader();

    this.renderOverview();
    this.renderTrend();
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

  setByKey = (key, data) => {
    this.computedData = {
      ...this.computedData,
      [key]: {
        ...this.computedData[key],
        ...data,
      },
    };
  };

  bind = () => {
    const instance = this;
    this.element.$trendDatePicker.addEventListener("change", function () {
      instance.trendDateChangeHandler(this.value);
    });

    this.element.$bigProductTypeSelect.addEventListener(
      "change",
      this.bigProductTypeSelectChangeHandler
    );

    this.element.$brandSelect.addEventListener(
      "change",
      this.brandSelectChangeHandler
    );

    this.element.$productTypeSelect.addEventListener(
      "change",
      this.productTypeSelectChangeHandler
    );

    this.element.$ruleInfo.addEventListener("click", this.ruleInfoClickHandler);

    this.element.$yearSelect.addEventListener("change", function () {
      instance.yearChangeHandler(this.value);
    });

    this.element.$dateSelect.addEventListener("change", function () {
      instance.dateChangeHandler(this.value);
    });

    this.element.$radarRemindBtn.addEventListener(
      "click",
      instance.radarRemindClickHandler
    );

    this.element.$healthPanel.addEventListener(
      "change",
      this.healthTagsChangeHandler
    );

    this.element.$riskPanel.addEventListener(
      "change",
      this.riskTagsChangeHandler
    );

    super.observe(this.element.$contentWrapper, () => {
      this.healthRadarInstance.resize();

      this.riskRadarInstance.resize();

      this.healthTrendInstance.resize();
    });
  };

  initOverview(dateRange) {
    const yearRange = [...new Set(dateRange.map((date) => date.split("-")[0]))]
      .slice(1)
      .toReversed();

    const currentYear = yearRange[0];

    const dateList = computeDateList(Number(currentYear));

    const selectedDate = dateList[0].value;

    this.setByKey("overview", {
      currentYear,
      yearList: yearRange,
      dateList,
      selectedDate,
    });
  }

  initTrend(dateRange) {
    const endDate = dateRange[dateRange.length - 1];
    const startDate = dateRange[dateRange.length - 6];
    this.element.$trendDatePicker.value = `${startDate} 至 ${endDate}`;
    this.element.$trendDatePicker.min = dateRange[0];
    this.element.$trendDatePicker.max = endDate;

    this.setByKey("trend", {
      startDate,
      endDate,
    });
  }

  radarRemindClickHandler = () => {
    this.element.$radarRemindDialog.open = true;
  };

  ruleInfoClickHandler = () => {
    this.element.$tagRemindDialog.open = true;
  };

  trendDateChangeHandler(dateRange) {
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());

    this.setByKey("trend", {
      startDate,
      endDate,
    });
    this.renderTrend();
  }

  // 产品大类选择
  bigProductTypeSelectChangeHandler = (e) => {
    const { brandOptions } = getBrandByBigProductType(
      this.data,
      e.target.value
    );
    this.set({
      bigProductTypeValue: e.target.value,
      brandOptions,
      brand: brandOptions.at(0).value,
    });
    this.updateCurrentRangeData();

    this.renderHeader();

    this.renderRadar();

    this.renderTrend();
  };

  brandSelectChangeHandler = (e) => {
    this.set({
      brand: e.target.value,
    });
    this.updateCurrentRangeData();

    this.renderProductType();

    this.renderRadar();

    this.renderTrend();
  };

  productTypeSelectChangeHandler = (e) => {
    this.set({
      productType: e.target.value,
    });
    this.updateCurrentRangeData();

    this.renderRadar();

    this.renderTrend();
  };

  yearChangeHandler(value) {
    this.setByKey("overview", {
      currentYear: value,
    });
    const { overview } = this.get("overview");
    const { selectedDate } = overview;

    const dateList = computeDateList(Number(value));

    const dateValueList = dateList.map((date) => date.value);

    const currentSelectedDate = dateValueList.includes(selectedDate)
      ? selectedDate
      : dateList[0].value;

    this.setByKey("overview", {
      dateList,
      selectedDate: currentSelectedDate,
    });

    // 重新渲染
    this.renderDateSelect();
    this.renderRadar();
  }

  dateChangeHandler(value) {
    this.setByKey("overview", {
      selectedDate: value,
    });

    // 重新渲染

    this.renderRadar();
  }

  healthTagsChangeHandler = (event) => {
    if (event.target.type !== "checkbox") return;

    // 3. 获取该面板下所有被勾选的 checkbox
    const checkedBoxes = this.element.$healthPanel.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    // 4. 提取所有选中项的 value 值并组成数组
    const selectedValues = Array.from(checkedBoxes).map((box) => box.value);

    this.setByKey("trend", {
      healthTags: selectedValues,
    });

    this.element.$healthInput.value = selectedValues.join(" 、");

    this.renderTrend();
  };

  riskTagsChangeHandler = (event) => {
    if (event.target.type !== "checkbox") return;

    // 3. 获取该面板下所有被勾选的 checkbox
    const checkedBoxes = this.element.$riskPanel.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    // 4. 提取所有选中项的 value 值并组成数组
    const selectedValues = Array.from(checkedBoxes).map((box) => box.value);

    this.setByKey("trend", {
      riskTags: selectedValues,
    });

    this.element.$riskInput.value = selectedValues.join(" 、");

    this.renderTrend();
  };

  updateCurrentRangeData() {
    const { bigProductTypeValue, brand, productType } = this.get(
      "bigProductTypeValue",
      "brand",
      "productType"
    );
    const currentRangeData = computeCurrentDataRangeV2({
      data: this.data,
      bigProductTypeValue,
      brand,
      productType,
    });
    const currentRangeExcludeBrandData = computeCurrentDataRangeV2({
      data: this.data,
      bigProductTypeValue,
      brand,
      productType,
      options: {
        excludeBrand: true, // 计算除去自身品牌的其他
      },
    });

    this.set({
      currentRangeData,
      currentRangeExcludeBrandData,
    });
  }

  renderHeader() {
    this.renderBigProductType();
    this.renderBrandSelect();
    this.renderProductType();
  }

  initTagOptions() {
    const healthOptions = computeCheckboxFragment(HEALTH_RULES_LIST);
    const riskOptions = computeCheckboxFragment(RISK_RULES_LIST);

    this.element.$healthOptionsWrapper.appendChild(healthOptions);

    this.element.$riskOptionsWrapper.appendChild(riskOptions);

    [this.element.$healthPanel, this.element.$riskPanel].forEach((ele) => {
      const checkboxes = ele.querySelectorAll('input[type="checkbox"]');
      Array.from(checkboxes).forEach((checkbox) => {
        checkbox.checked = true;
      });
    });
  }

  renderBigProductType = () => {
    const { bigProductTypeValue } = this.get("bigProductTypeValue");
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

  renderBrandSelect() {
    const { brandOptions } = this.get("brandOptions");
    const menuFragment = computedMenuOptionsFragment(brandOptions, true);
    this.element.$brandSelect.innerHTML = null;
    this.element.$brandSelect.appendChild(menuFragment);
    this.element.$brandSelect.value = brandOptions[0].value;
  }

  renderProductType() {
    const { bigProductTypeValue, brand } = this.get(
      "bigProductTypeValue",
      "brand"
    );

    const { productTypeOptions } = getProductType(
      this.data,
      { bigProductType: bigProductTypeValue, brand },
      true
    );

    const menuFragment = computedMenuOptionsFragment(productTypeOptions, true);
    this.element.$productTypeSelect.innerHTML = null;
    this.element.$productTypeSelect.appendChild(menuFragment);
    this.element.$productTypeSelect.value = productTypeOptions[0].value;
  }

  renderOverview() {
    this.renderYearSelect();
    this.renderDateSelect();
    this.renderRadar();
  }

  renderYearSelect = () => {
    const { overview } = this.get("overview");
    const { yearList, currentYear } = overview;
    if (yearList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(yearList);
      this.element.$yearSelect.innerHTML = null;
      this.element.$yearSelect.appendChild(menuFragment);
      this.element.$yearSelect.value = currentYear;
    }
  };

  renderDateSelect = () => {
    const { overview } = this.get("overview");
    const { dateList, selectedDate } = overview;

    if (dateList.length > 0) {
      const menuFragment = computedMenuOptionsFragment(dateList, true);
      this.element.$dateSelect.innerHTML = null;
      this.element.$dateSelect.appendChild(menuFragment);
      this.element.$dateSelect.value = selectedDate;
    }
  };

  renderRadar() {
    const { currentRangeData, currentRangeExcludeBrandData, overview } =
      this.get("currentRangeData", "currentRangeExcludeBrandData", "overview");
    const { currentYear, selectedDate } = overview;

    const { dataRange: singleBrandData } = computeCurrentDataRangeV3(
      currentRangeData,
      currentYear,
      selectedDate
    );

    const { dataRange: allBrandData } = computeCurrentDataRangeV3(
      currentRangeExcludeBrandData,
      currentYear,
      selectedDate
    );

    const stats = countIngredientTagsByLabel(singleBrandData);

    const allBrandStats = countIngredientTagsByLabel(allBrandData);

    const { healthOption, riskOption } = generateCompareRadarOptions(
      stats,
      allBrandStats
    );

    this.riskRadarInstance.setOption(riskOption, setOptionConfig);

    this.healthRadarInstance.setOption(healthOption, setOptionConfig);
  }
  renderTrend() {
    const { currentRangeData, currentRangeExcludeBrandData, trend } = this.get(
      "currentRangeData",
      "currentRangeExcludeBrandData",
      "brand",
      "trend"
    );
    const { startDate, endDate, riskTags, healthTags } = trend;

    const startDateIndex = currentRangeData.findIndex(
      (d) => d["月份"] === startDate
    );
    const endDateIndex = currentRangeData.findLastIndex(
      (d) => d["月份"] === endDate
    );

    const startDateExcludeBrandIndex = currentRangeExcludeBrandData.findIndex(
      (d) => d["月份"] === startDate
    );
    const endDateExcludeBrandIndex = currentRangeExcludeBrandData.findLastIndex(
      (d) => d["月份"] === endDate
    );

    const filteredData = currentRangeData.slice(startDateIndex, endDateIndex);
    const filteredExcludeBrandData = currentRangeExcludeBrandData.slice(
      startDateExcludeBrandIndex,
      endDateExcludeBrandIndex
    );

    if (filteredData.length === 0) {
      // 【空状态处理】直接通过 setOption 渲染文字提示
      const emptyOptions = {
        title: {
          text: "暂无数据",
          x: "center",
          y: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "normal",
            color: "#999",
          },
        },
        // 强制隐藏可能残留的坐标轴、图例等组件
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
      };

      // ⚠️ 关键：第二个参数设为 true (notMerge)，清除之前的配置，防止新旧配置合并冲突
      this.healthTrendInstance.clear(); // 先清空画布
      this.healthTrendInstance.setOption(emptyOptions, true);
    } else {
      const healthRules = HEALTH_RULES.filter(({ label }) =>
        healthTags.includes(label)
      );

      const riskRules = RISK_RULES.filter(({ label }) =>
        riskTags.includes(label)
      );

      const brandStats = calculateMonthlyTagCounts(
        filteredData,
        healthRules,
        riskRules
      );

      // 不需要除品牌数，比如 A 月有 50 个品牌，B 月有 100 个品牌，导致失真

      const industryStats = calculateMonthlyTagCounts(
        filteredExcludeBrandData,
        healthRules,
        riskRules
      );

      const options = generateTrendChartOptions(brandStats, industryStats);

      this.healthTrendInstance.setOption(options, setOptionConfig);
    }
  }
}
