
const { setOptionConfig } = window.parent.echartsVariables;

class PotentialIngredientList  {
  data = [];
  ingredientDropInstance = null;
  computedData = {
    startDateIndex: 0,
    endDateIndex: 0,
    currentRangeData: [],
    productSelectOptions: [],
  };

  element = {
    $datePicker: document.querySelector("#potential-ingredient-date-picker"),
    $potentialList: document.querySelector("#potentialList"),
    $emptySection: document.querySelector("#emptySection"),
    $pageLoading: document.querySelector("#pageLoading"),
  };
  constructor(initData) {
    this.init(initData);
    this.setup();
    this.bind();
  }

  init = (initData) => {
    this.data = initData;

    const dateRange = [...new Set(this.data.map((item) => item["月份"]))];
    const lastDate = dateRange[dateRange.length - 1];
    const startDate = dateRange[dateRange.length - 13];
    this.element.$datePicker.value = `${startDate} 至 ${lastDate}`;
    this.element.$datePicker.min = dateRange[0];
    this.element.$datePicker.max = lastDate;
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === lastDate);

    this.set({
      startDateIndex,
      endDateIndex,
    });

    this.updateData();

    this.newProductTrendInstance = window.parent.echarts.init(
      this.element.$productTrend
    );

    this.element.$pageLoading.classList.add("hide");
  };


  setup() {
    this.renderHeaderSelect();
    this.renderNewProductBrandTrend(PRODUCT_NAME);
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
    this.element.$datePicker.addEventListener("change", function () {
      instance.dateChangeHandler(this.value);
    });

    this.element.$bigProductTypeSelect.addEventListener(
      "change",
      this.bigProductTypeSelectChangeHandler
    );

    document
      .getElementById("ingredientSelectContainer")
      .addEventListener("click", this.ingredientButtonSelectHandler);

    document
      .getElementById("ingredientSelectContainer")
      .addEventListener("keyup", this.ingredientSearchHandler);

    document
      .getElementById("ingredientSelectContainer")
      .addEventListener("input", this.ingredientSearchInputHandler);

    document
      .querySelector(`#ingredientSelectContainer`)
      .addEventListener("click", this.ingredientSelectHandler);

    document.addEventListener("click", this.hidePanel);

    document
      .getElementById("productTypeSelect")
      .addEventListener("click", this.productButtonSelectHandler);

    document
      .getElementById("productTypeSelect")
      .addEventListener("click", (e) =>
        this.productSelectedHandler(e, PRODUCT_SELECT_BUTTON_ID)
      );

    super.observe(this.element.$contentWrapper, () => {
      this.newProductTrendInstance.resize();
      this.brandTrendInstance.resize();
    });
  };

  renderFilter() {
    this.renderHeaderSelect();
    this.renderIngredientSelectPanelComponent();
    this.renderProductSelectComponent();
  }

  reRender = () => {
    // 重新渲染
    this.renderNewProductBrandTrend(PRODUCT_NAME);
    this.renderNewProductBrandTrend(BRAND_NAME);
  };

  dateChangeHandler(dateRange) {
    const [startDate, endDate] = dateRange
      .split("至")
      .map((value) => value.trim());
    const startDateIndex = this.data.findIndex((d) => d["月份"] === startDate);
    const endDateIndex = this.data.findLastIndex((d) => d["月份"] === endDate);
    this.set({
      startDateIndex,
      endDateIndex,
    });
    this.updateData();

    this.renderFilter();

    this.reRender();
  }

  // 产品大类选择
  bigProductTypeSelectChangeHandler = (e) => {
    this.set({
      bigProductTypeValue: e.target.value,
    });

    this.updateData();
    this.renderFilter();
    this.reRender();
  };

  updateData() {
    const { startDateIndex, endDateIndex } = this.get(
      "startDateIndex",
      "endDateIndex",
    );

    const filteredData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex,
      endDateIndex,
      bigProductTypeValue,
    });


  }

  updateCurrentRangeData() {
    const {
      startDateIndex,
      endDateIndex,
      selectedIngredient,
      productTypeValue,
      bigProductTypeValue,
    } = this.get(
      "startDateIndex",
      "endDateIndex",
      "selectedIngredient",
      "productTypeValue",
      "bigProductTypeValue"
    );

    const currentData = computedCurrentDataAndRange({
      data: this.data,
      startDateIndex,
      endDateIndex,
      bigProductTypeValue,
      productTypeValue,
    });

    this.set({
      currentRangeData: currentData.filter(
        (item) => item["加工后成分"] === selectedIngredient
      ),
    });
  }

  // 绘制数量趋势
  renderNewProductBrandTrend = (name) => {
    const isBrand = name === BRAND_NAME;
    const emptySectionId = isBrand ? "brandSection" : "productSection";
    const sectionEle = isBrand
      ? this.element.$brandSection
      : this.element.$productSection;
    const chartEle = isBrand
      ? this.element.$brandTrend
      : this.element.$productTrend;
    const chartInstance = isBrand
      ? this.brandTrendInstance
      : this.newProductTrendInstance;
    const { currentRangeData } = this.get("currentRangeData");
    
    const emptySection = document.querySelector(
      `#${emptySectionId} .empty-content`
    );
    if (emptySection) {
      sectionEle.removeChild(emptySection);
    }

    if (currentRangeData.length === 0) {
      chartEle.classList.add("hide");
      sectionEle.appendChild(
        this.element.$emptySection.content.cloneNode(true)
      );
    } else {
      chartEle.classList.remove("hide");

      const trendData = computedTrendData(currentRangeData, name);
      chartInstance.setOption(
        getTrendOptions({ ...trendData }),
        setOptionConfig
      );
    }
  };
}
