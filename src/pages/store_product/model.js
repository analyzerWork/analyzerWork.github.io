const { setOptionConfig } = window.parent.echartsVariables;

class StoreProduct extends CustomResizeObserver {
  data = [];
  bigProductTypeOptions = BIG_PRODUCT_OPTIONS;
  storeCountOptions = STORE_COUNT_OPTIONS;
  pageSize = 10;
  healthRadarInstance = null;
  textureRadarInstance = null;
  flavorRadarInstance = null;
  burdenRadarInstance = null;
  stabilityRadarInstance = null;
  personaPieInstance = null;
  personaComparedPieInstance = null;
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
    currentDateStr: "",
    comparedDateStr: "",
    productTypeOptions: [],
    bigProductTypeValue: BIG_PRODUCT_OPTIONS.at(0).value,
    productType: SELECT_ALL_VALUE,
    storeCount: STORE_COUNT_OPTIONS.at(0).value,
    currentRangeData: [],
    currentComparedRangeData: [],
    currentTaggedProducts: [],
    currentComparedTaggedProducts: [],
    detailList:[],
    
  };

  element = {
    $yearSelect: document.querySelector("#yearSelect"),
    $dateSelect: document.querySelector("#dateSelect"),
    $comparedSelect: document.querySelector("#comparedSelect"),
    $bigProductTypeSelect: document.querySelector("#bigProductTypeSelect"),
    $productTypeSelect: document.querySelector("#productTypeSelect"),
    $storeCountSelect: document.querySelector("#storeCountSelect"),
    $contentWrapper: document.querySelector("#contentWrapper"),
    $productDimensionRemindBtn: document.querySelector(
      "#productDimensionRemindBtn"
    ),
    $productDimensionRemindDialog: document.querySelector(
      "#productDimensionRemindDialog"
    ),

    $personaRemindBtn: document.querySelector(
      "#personaRemindBtn"
    ),


    $personaRemindDialog: document.querySelector(
      "#personaRemindDialog"
    ),

    $emptySection: document.querySelector("#emptySection"),
    $healthRadar: document.querySelector("#healthRadar"),
    $textureRadar: document.querySelector("#textureRadar"),
    $flavorRadar: document.querySelector("#flavorRadar"),
    $burdenRadar: document.querySelector("#burdenRadar"),
    $stabilityRadar: document.querySelector("#stabilityRadar"),

    $personaPie: document.querySelector("#personaPie"),
    $personaComparedPie: document.querySelector("#personaComparedPie"),
    $personaDetail: document.querySelector("#personaDetail"),
    $insightTableBody: document.querySelector("#insightTableBody"),
    $pagination:document.querySelector('ui-pagination'),

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

    this.initFilter();
    this.healthRadarInstance = window.parent.echarts.init(
      this.element.$healthRadar
    );
    this.textureRadarInstance = window.parent.echarts.init(
      this.element.$textureRadar
    );
    this.flavorRadarInstance = window.parent.echarts.init(
      this.element.$flavorRadar
    );
    this.stabilityRadarInstance = window.parent.echarts.init(
      this.element.$stabilityRadar
    );
    this.burdenRadarInstance = window.parent.echarts.init(
      this.element.$burdenRadar
    );

    this.personaPieInstance = window.parent.echarts.init(
      this.element.$personaPie
    );

    this.personaComparedPieInstance = window.parent.echarts.init(
      this.element.$personaComparedPie
    );

    this.element.$pageLoading.classList.add("hide");
  };

  setup() {
    this.updateData();
    this.renderHeader();
    this.renderChart();
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

    this.element.$storeCountSelect.addEventListener(
      "change",
      this.storeCountSelectChangeHandler
    );

    this.element.$productDimensionRemindBtn.addEventListener(
      "click",
      instance.productDimensionRemindBtnClickHandler
    );

    this.element.$personaRemindBtn.addEventListener(
      "click",
      instance.personaRemindBtnClickHandler
    );

    this.personaPieInstance.on("click", (params) =>
      instance.personaPieClickHandler(params, "current")
    );
    this.personaComparedPieInstance.on("click", (params) =>
      instance.personaPieClickHandler(params, "compared")
    );

    this.element.$pagination.addEventListener('change',this.paginationChangeHandler)

    super.observe(this.element.$contentWrapper, () => {
      this.healthRadarInstance.resize();
      this.textureRadarInstance.resize();
      this.flavorRadarInstance.resize();
      this.burdenRadarInstance.resize();
      this.stabilityRadarInstance.resize();
      this.personaPieInstance.resize();
      this.personaComparedPieInstance.resize();
    });
  };

  initFilter() {
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

    const { bigProductTypeValue } = this.get("bigProductTypeValue");
    const { brandOptions } = getBrandByBigProductType(
      this.data,
      bigProductTypeValue
    );
    const brand = brandOptions.at(0).value;

    const { productTypeOptions } = getProductType(
      this.data,
      { bigProductType: bigProductTypeValue, brand },
      true
    );

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentDateStr,
      comparedDateStr,
    } = this.computeDataRangeIndex(selectedDate);

    this.set({
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentDateStr,
      comparedDateStr,
      brandOptions,
      brand: brandOptions.at(0).value,
      productTypeOptions,
      productType: productTypeOptions.at(0).value,
    });
  }

  updateData() {
    const {
      bigProductTypeValue,
      productType,
      storeCount,
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
    } = this.get(
      "bigProductTypeValue",
      "productType",
      "storeCount",
      "startDateIndex",
      "endDateIndex",
      "comparedStartDateIndex",
      "comparedEndDateIndex"
    );

    const currentRangeData = computeCurrentDataRangeV2({
      data: this.data,
      bigProductTypeValue,
      startDateIndex,
      endDateIndex,
      productType,
    });
    const currentComparedRangeData = computeCurrentDataRangeV2({
      data: this.data,
      bigProductTypeValue,
      startDateIndex: comparedStartDateIndex,
      endDateIndex: comparedEndDateIndex,
      productType,
    });

    const topPercentData = getTopStoresByPercent(
      currentRangeData,
      "门店数",
      storeCount
    );
    const topPercentCompareData = getTopStoresByPercent(
      currentComparedRangeData,
      "门店数",
      storeCount
    );

    this.set({
      currentRangeData: topPercentData,
      currentComparedRangeData: topPercentCompareData,
    });
  }
  yearChangeHandler(value) {
    this.set({
      currentYear: value,
    });
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
      dateList,
      selectedDate: currentSelectedDate,
      startDateIndex,
      endDateIndex,
      currentTdTitle,
      comparedTdTitle,
      comparedStartDateIndex,
      comparedEndDateIndex,
    });

    this.updateData();

    // 重新渲染
    this.renderDateSelect();
    this.renderHeader();
    this.renderChart();
  }

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
      currentDateStr,
      comparedDateStr,
    };
  };

  dateChangeHandler(value) {
    const comparedList = computeComparedList(value);

    // 对比项的值直接取第一个即可，要么不变，要么只有一个
    const currentComparedDate = comparedList[0].value;

    this.set({
      comparedList,
      selectedDate: value,
      selectedCompared: currentComparedDate,
    });

    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentDateStr,
      comparedDateStr,
    } = this.computeDataRangeIndex(value);

    this.set({
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentDateStr,
      comparedDateStr,
    });

    this.updateData();

    // 重新渲染
    this.renderComparedSelect();
    this.renderHeader();
    this.renderChart();
  }

  comparedChangeHandler(value) {
    const { selectedDate } = this.get("selectedDate");
    this.set({
      selectedCompared: value,
    });
    const {
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      comparedDateStr,
      currentDateStr,
    } = this.computeDataRangeIndex(selectedDate);

    this.set({
      startDateIndex,
      endDateIndex,
      comparedStartDateIndex,
      comparedEndDateIndex,
      currentTdTitle: currentDateStr,
      comparedTdTitle: comparedDateStr,
    });
    this.updateData();
    this.renderHeader();
    this.renderChart();
  }

  // 产品大类选择
  bigProductTypeSelectChangeHandler = (e) => {
    const { productTypeOptions } = getProductType(
      this.data,
      { bigProductType: e.target.value },
      true
    );
    this.set({
      bigProductTypeValue: e.target.value,
      productType: productTypeOptions.at(0).value,
      productTypeOptions,
    });
    this.updateData();
    this.renderProductType();
    this.renderChart();
  };

  productTypeSelectChangeHandler = (e) => {
    this.set({
      productType: e.target.value,
    });
    this.updateData();

    this.renderChart();
  };

  productDimensionRemindBtnClickHandler = () => {
    this.element.$productDimensionRemindDialog.open = true;
  };

  personaRemindBtnClickHandler = () => {
    this.element.$personaRemindDialog.open = true;
  };

  storeCountSelectChangeHandler = (e) => {
    this.set({
      storeCount: e.target.value,
    });
    this.updateData();

    this.renderChart();
  };

  personaPieClickHandler = (params, type) => {
    if (params.componentType === "series") {
      const { currentTaggedProducts, currentComparedTaggedProducts,currentDateStr,comparedDateStr} = this.get(
        "currentTaggedProducts",
        "currentComparedTaggedProducts",
        "currentDateStr",
        "comparedDateStr"
      );
      const data =
        type === "current"
          ? currentTaggedProducts
          : currentComparedTaggedProducts;
      const title = type === "current" ? currentDateStr :comparedDateStr;
      const targetPersona = params.name; // 获取被点击的画像名称

      // 【关键】调用您提供的函数提取该画像下的明细产品
      const detailList = extractDetailProducts(data, targetPersona);

     

      const $title = document.querySelector("#personaDetail #detailTitle");

      $title.innerHTML = `${title} [${targetPersona}] 画像下钻透视列表`;

      this.element.$pagination.total = detailList.length;
      this.element.$pagination.current = 1;
      this.renderInsightTable(detailList.slice(0,this.pageSize));

      this.set({
        detailList
      });
    

      $title.scrollIntoView({behavior:'smooth'})
    }
  };

  paginationChangeHandler = (e) => {
    const {detailList} = this.get("detailList");
    const detail = e.detail;
    this.element.$pagination.current = detail.current;
    this.renderInsightTable(detailList.slice((detail.current-1)*this.pageSize,detail.current*this.pageSize));
    const $title = document.querySelector("#personaDetail #detailTitle");
    $title.scrollIntoView({behavior:'smooth'})

  }

  renderHeader() {
    this.renderYearSelect();
    this.renderDateSelect();
    this.renderComparedSelect();
    this.renderBigProductType();
    this.renderProductType();
    this.renderStoreCount();
  }

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

  renderStoreCount = () => {
    const { storeCount } = this.get("storeCount");
    if (this.storeCountOptions.length > 0) {
      const menuFragment = computedMenuOptionsFragment(
        this.storeCountOptions,
        true
      );
      this.element.$storeCountSelect.innerHTML = null;
      this.element.$storeCountSelect.appendChild(menuFragment);
      this.element.$storeCountSelect.value = storeCount;
    }
  };

  renderProductType() {
    const { bigProductTypeValue } = this.get("bigProductTypeValue");
    const { productTypeOptions } = getProductType(
      this.data,
      { bigProductType: bigProductTypeValue },
      true
    );

    const menuFragment = computedMenuOptionsFragment(productTypeOptions, true);
    this.element.$productTypeSelect.innerHTML = null;
    this.element.$productTypeSelect.appendChild(menuFragment);
    this.element.$productTypeSelect.value = productTypeOptions[0].value;
  }

  renderChart() {
    this.renderProductChart();
    this.renderPersonaChart();
  }

  renderProductChart() {
    const {
      currentRangeData,
      currentComparedRangeData,
      currentDateStr,
      comparedDateStr,
    } = this.get(
      "currentRangeData",
      "currentComparedRangeData",
      "currentDateStr",
      "comparedDateStr"
    );

    const currentCountResult = analyzeConsumerExperience(
      currentRangeData,
      RULES_MAP
    );
    const comparedCountResult = analyzeConsumerExperience(
      currentComparedRangeData,
      RULES_MAP
    );

    const configList = generateRadarOptions(
      currentCountResult,
      comparedCountResult,
      {
        title: currentDateStr,
        comparedTitle: comparedDateStr,
      }
    );

    configList.forEach(({ key, option }) => {
      this[`${key}RadarInstance`].setOption(option, setOptionConfig);
    });
  }

  renderPersonaChart() {
    const {
      currentRangeData,
      currentComparedRangeData,
      currentDateStr,
      comparedDateStr,
    } = this.get(
      "currentRangeData",
      "currentComparedRangeData",
      "currentDateStr",
      "comparedDateStr"
    );

    const currentPersonaData = aggregatePersonaStats(currentRangeData);
    const currentPersonaComparedData = aggregatePersonaStats(
      currentComparedRangeData
    );

    this.set({
      currentTaggedProducts: currentPersonaData.taggedProducts,
      currentComparedTaggedProducts: currentPersonaComparedData.taggedProducts,
    });

    const currentOption = getBarChartOption(currentPersonaData, currentDateStr);

    const currentComparedOption = getBarChartOption(
      currentPersonaComparedData,
      comparedDateStr
    );

    this.personaPieInstance.setOption(currentOption, setOptionConfig);
    this.personaComparedPieInstance.setOption(
      currentComparedOption,
      setOptionConfig
    );
  }

  renderInsightTable = (data) => {
   
    this.element.$insightTableBody.innerHTML = null;

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
    this.element.$insightTableBody.appendChild(tbodyFragment);
    this.element.$personaDetail.classList.remove("hide");
  };

}
